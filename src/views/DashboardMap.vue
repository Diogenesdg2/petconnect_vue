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
  console.log('Mapa inicializado:', map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
  L.Marker.prototype.options.icon = DefaultIcon

  try {
    const db = getFirestore()

    // Buscar pets do usuário (parte que já está funcionando)
    const petsRef = collection(db, 'Pets')
    const petsQuery = query(
      petsRef,
      where('userId', '==', currentUser.uid)
    )

    const petsSnapshot = await getDocs(petsQuery)
    console.log('Pets encontrados:', petsSnapshot.size)

    if (petsSnapshot.empty) {
      console.log('Nenhum pet encontrado para este usuário')
      noLocationFound.value = true
      return
    }

    // Array para armazenar os marcadores
    const markers = []
    const bounds = L.latLngBounds()

    // Para cada pet do usuário
    for (const petDoc of petsSnapshot.docs) {
      const petData = petDoc.data()
      console.log('Buscando localização do pet:', petData.nome)

      // Buscar a última localização deste pet
      const locationsRef = collection(db, 'Localizacoes')
      const locQuery = query(
        locationsRef,
        where('petId', '==', petDoc.id),
        orderBy('timestamp', 'desc'),
        limit(1)
      )

      try {
        const locationSnapshot = await getDocs(locQuery)

        if (!locationSnapshot.empty) {
          const locationData = locationSnapshot.docs[0].data()
          console.log(`Localização encontrada para ${petData.nome}:`, locationData)

          if (locationData.latitude && locationData.longitude) {
            // Criar marcador para este pet
            const marker = L.marker([locationData.latitude, locationData.longitude])
              .addTo(map)
              .bindPopup(`
                <b>${petData.nome}</b><br>
                Última atualização: ${formatTimestamp(locationData.timestamp)}
              `)

            marker.on('click', () => {
              selectedLocation.value = {
                ...locationData,
                nomePet: petData.nome,
                nomeTutor: petData.nomeTutor || currentUser.displayName,
                telefone: petData.telefone || 'Não informado'
              }
            })

            markers.push(marker)
            bounds.extend([locationData.latitude, locationData.longitude])
          }
        } else {
          console.log(`Nenhuma localização encontrada para ${petData.nome}`)
        }
      } catch (error) {
        console.error(`Erro ao buscar localização do pet ${petData.nome}:`, error)
      }
    }

    // Se encontrou alguma localização
    if (markers.length > 0) {
      // Ajustar o zoom para mostrar todos os pets
      map.fitBounds(bounds, {
        padding: [50, 50], // padding em pixels
        maxZoom: 15 // zoom máximo
      })

      // Se só tem um pet, abrir o popup automaticamente
      if (markers.length === 1) {
        markers[0].openPopup()
      }
    } else {
      console.log('Nenhuma localização encontrada para os pets')
      noLocationFound.value = true
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code
    })
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

<style scoped>
/* Note o "scoped" adicionado aqui em cima */

.dashboard-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
}
#map {
  width: 100% !important;
  height: 100% !important;
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

/* Ajustes para dispositivos móveis */
@media (max-width: 768px) {
  .location-info {
    top: auto;
    bottom: 20px;
    right: 50%;
    transform: translateX(50%);
    width: 90%;
    max-width: 400px;
  }
}

/* Ajustes para telas muito pequenas */
@media (max-height: 500px) {
  .location-info {
    max-height: 80vh;
    overflow-y: auto;
  }
}
</style>

<!-- Estilos não-scoped apenas para classes do Leaflet -->
<style>
.leaflet-popup-content-wrapper {
  border-radius: 8px;
  padding: 5px;
}

.leaflet-popup-content {
  margin: 8px;
  min-width: 200px;
}

.leaflet-control-container {
  z-index: 1000;
}
</style>
