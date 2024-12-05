<template>
  <div class="dashboard-container">
    <div id="map" ref="mapContainer" class="map-container"></div>

    <!-- Popup de informações -->
    <div v-if="selectedLocation" class="location-info">
      <h3>Informações do Pet</h3>
      <p><strong>Nome do Pet:</strong> {{ selectedLocation.nomePet }}</p>
      <p><strong>Tutor:</strong> {{ selectedLocation.nomeTutor }}</p>
      <p><strong>Telefone:</strong> {{ selectedLocation.telefone }}</p>
      <p><strong>Última Atualização:</strong> {{ formatTimestamp(selectedLocation.timestamp) }}</p>
      <button @click="selectedLocation = null" class="close-button">Fechar</button>
    </div>

    <!-- Mensagem quando não há localização -->
    <div v-if="noLocationFound" class="no-location-info">
      Nenhuma localização encontrada para seu pet.
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

export default {
  name: 'DashboardMap',
  setup() {
    const mapContainer = ref(null)
    const selectedLocation = ref(null)
    const noLocationFound = ref(false)
    let map = null

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('pt-BR')
    }

    const initMap = async () => {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        console.error('Usuário não está logado')
        return
      }

      // Inicializar mapa
      map = L.map('map').setView([-22.1740094, -47.3938169], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Configurar ícone padrão
      let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
      L.Marker.prototype.options.icon = DefaultIcon

      try {
        const db = getFirestore()

        // Buscar o último registro do pet do usuário logado
        const locationsRef = collection(db, 'Localizacoes')
        const q = query(
          locationsRef,
          where('petID', '==', currentUser.uid), // Assumindo que petID é o ID do usuário
          orderBy('timestamp', 'desc'),
          limit(1)
        )

        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          console.log('Nenhuma localização encontrada')
          noLocationFound.value = true
          return
        }

        const doc = querySnapshot.docs[0]
        const data = doc.data()
        console.log('Localização encontrada:', data)

        // Adicionar marcador ao mapa
        if (data.latitude && data.longitude) {
          // Centralizar mapa na localização do pet
          map.setView([data.latitude, data.longitude], 15)

          const marker = L.marker([data.latitude, data.longitude])
            .addTo(map)
            .bindPopup(`
              <b>${data.nomePet}</b><br>
              Última atualização: ${formatTimestamp(data.timestamp)}
            `)

          marker.on('click', () => {
            selectedLocation.value = data
          })

          // Abrir popup automaticamente
          marker.openPopup()
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    onMounted(async () => {
      await initMap()
    })

    return {
      mapContainer,
      selectedLocation,
      noLocationFound,
      formatTimestamp
    }
  }
}
</script>

<style>
.dashboard-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.location-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
}

.no-location-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
}

.close-button {
  background: #154ABC;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #0d3285;
}

.leaflet-popup-content-wrapper {
  border-radius: 8px;
  padding: 5px;
}

.leaflet-popup-content {
  margin: 8px;
}
</style>
