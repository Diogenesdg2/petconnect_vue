<template>
  <div class="dashboard-container">
    <!-- Container do mapa -->
    <div id="map" class="map-container"></div>

    <!-- Popup de informações -->
    <div v-if="selectedLocation" class="location-info">
      <h3>Informações do Pet</h3>
      <p><strong>Nome do Pet:</strong> {{ selectedLocation.nomePet }}</p>
      <p><strong>Tutor:</strong> {{ selectedLocation.nomeTutor }}</p>
      <p><strong>Telefone:</strong> {{ selectedLocation.telefone }}</p>
      <p><strong>Data:</strong> {{ formatDate(selectedLocation.timestamp) }}</p>
      <button @click="selectedLocation = null" class="close-button">Fechar</button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

export default {
  name: 'DashboardMap',
  setup() {
    const map = ref(null)
    const locations = ref([])
    const selectedLocation = ref(null)

    // Função para formatar a data
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('pt-BR')
    }

    // Inicializar mapa e carregar dados
    onMounted(async () => {
      // Inicializar mapa
      map.value = L.map('map').setView([-22.1740094, -47.3938169], 13)

      // Adicionar layer do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value)

      // Buscar localizações no Firestore
      const db = getFirestore()
      const locationsCollection = collection(db, 'Localizacoes')

      try {
        const snapshot = await getDocs(locationsCollection)
        locations.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Adicionar marcadores ao mapa
        locations.value.forEach(location => {
          const marker = L.marker([location.latitude, location.longitude])
            .addTo(map.value)
            .bindPopup(`
              <b>${location.nomePet}</b><br>
              Tutor: ${location.nomeTutor}<br>
              <button onclick="showDetails('${location.id}')" class="marker-button">
                Ver Detalhes
              </button>
            `)

          // Adicionar evento de clique no marcador
          marker.on('click', () => {
            selectedLocation.value = location
          })
        })

        // Adicionar método global para acesso via popup
        window.showDetails = (locationId) => {
          const location = locations.value.find(l => l.id === locationId)
          if (location) {
            selectedLocation.value = location
          }
        }

      } catch (error) {
        console.error('Erro ao buscar localizações:', error)
      }
    })

    return {
      selectedLocation,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  position: relative;
  width: 100%;
  height: 100vh;
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
  transform: translateY(-2px);
}

/* Estilo para o popup do marcador */
:global(.marker-button) {
  background: #154ABC;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 5px;
  font-size: 12px;
}

:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 5px;
}

:global(.leaflet-popup-content) {
  margin: 8px;
}
</style>
