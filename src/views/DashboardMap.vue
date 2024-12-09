<template>
  <div class="dashboard-container">
    <div id="map" ref="mapContainer" class="map-container"></div>

    <!-- Legenda -->
    <div class="map-legend">
      <div class="legend-title">Meus Pets</div>
      <div class="legend-items">
        <div v-for="pet in petsLegend" :key="pet.nome" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: pet.color }"></div>
          <span class="legend-name">{{ pet.nome }}</span>
        </div>
      </div>
    </div>

    <!-- Popup de informações -->
    <div v-if="selectedLocation" class="location-info">
      <div class="pet-marker-color" :style="{ backgroundColor: selectedLocation.markerColor }"></div>
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

export default {
  name: 'DashboardMap',
  setup() {
    const mapContainer = ref(null)
    const selectedLocation = ref(null)
    const noLocationFound = ref(false)
    const petsLegend = ref([]) // Novo ref para a legenda
    let map = null

    // Lista de cores para os marcadores
    const markerColors = [
      '#FF0000', // Vermelho
      '#0000FF', // Azul
      '#008000', // Verde
      '#FFA500', // Laranja
      '#800080', // Roxo
      '#FF1493', // Rosa
      '#00FFFF', // Ciano
      '#FFD700', // Dourado
      '#8B4513', // Marrom
      '#4B0082'  // Índigo
    ]

    // Função para criar ícone colorido
    const createColoredIcon = (color) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      })
    }

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

      map = L.map('map').setView([-22.1740094, -47.3938169], 13)
      console.log('Mapa inicializado:', map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      try {
        const db = getFirestore()
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

        const markers = []
        const bounds = L.latLngBounds()
        const legendItems = [] // Array para itens da legenda

        // Para cada pet do usuário
        for (const [index, petDoc] of petsSnapshot.docs.entries()) {
          const petData = petDoc.data()
          const petColor = markerColors[index % markerColors.length]

          // Adicionar à legenda
          legendItems.push({
            nome: petData.nome,
            color: petColor
          })

          console.log('Buscando localização do pet:', petData.nome)
          console.log('Adicionado à legenda:', petData.nome, petColor)

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
                const marker = L.marker(
                  [locationData.latitude, locationData.longitude],
                  { icon: createColoredIcon(petColor) }
                )
                  .addTo(map)
                  .bindPopup(`
                    <div style="text-align: center;">
                      <div style="
                        width: 12px;
                        height: 12px;
                        background-color: ${petColor};
                        border-radius: 50%;
                        margin: 0 auto 5px auto;
                        border: 2px solid white;
                        box-shadow: 0 0 2px rgba(0,0,0,0.5);
                      "></div>
                      <b>${petData.nome}</b><br>
                      Última atualização: ${formatTimestamp(locationData.timestamp)}
                    </div>
                  `)

                marker.on('click', () => {
                  selectedLocation.value = {
                    ...locationData,
                    nomePet: petData.nome,
                    nomeTutor: petData.nomeTutor || currentUser.displayName,
                    telefone: petData.telefone || 'Não informado',
                    markerColor: petColor
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
        console.log('Itens da legenda:', legendItems) // Debug
        petsLegend.value = [...legendItems]

        if (markers.length > 0) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15
          })

          if (markers.length === 1) {
            markers[0].openPopup()
          }
        } else {
          console.log('Nenhuma localização encontrada para os pets')
          noLocationFound.value = true
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
      formatTimestamp,
      petsLegend
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
  color:black;
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
  color:black;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 12px;
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
  .map-legend {
    top: 60px;
    left: 60px;
    max-width: 150px;
  }
}

/* Para telas muito pequenas */
@media (max-width: 480px) {
  .map-legend {
    top: 50px;
    left: 8px;
    padding: 8px;
    max-width: 150px;
    min-width: 120px;
  }

  .legend-title {
    font-size: 0.9em;
    margin-bottom: 6px;
    padding-bottom: 4px;
  }

  .legend-items {
    gap: 6px;
  }

  .legend-item {
    gap: 6px;
  }

  .legend-name {
    font-size: 0.85em;
  }

  .legend-color {
    width: 14px;
    height: 14px;
    border-width: 1.5px;
  }
}
.pet-marker-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 0 auto 10px auto;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
}

.location-info {
  text-align: center;
}

/* Adicione estes estilos junto com os outros dentro do style scoped */
.map-legend {
  position: absolute;
  top: 80px;
  left: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  max-width: 220px;
  min-width: 170px;
  background-color: rgba(196, 214, 226, 0.95);
}

.legend-title {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 12px;
  text-align: center;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.legend-name {
  font-size: 1.1em;
  color: black;

}

.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
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
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-marker div {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

</style>
