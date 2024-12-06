<template>
  <div class="app-container">
    <!-- Menu Superior -->
    <nav class="top-nav">
      <div class="nav-content">
        <div class="logo">PetConnect</div>
        <div class="nav-links">
          <router-link to="/cadastro-pets" class="nav-link">
            <span class="icon">➕</span> Novo Pet
          </router-link>
          <button @click="handleLogout" class="logout-btn">
            <span class="icon">🚪</span> Sair
          </button>
        </div>
      </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <h1 class="page-title">Meus Pets</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-message">
        Carregando seus pets...
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Lista de Pets -->
      <!-- Loading State -->
<div v-if="loading" class="loading-message">
  Carregando seus pets...
</div>

<!-- Error Message -->
<div v-if="error" class="error-message">
  {{ error }}
</div>

<!-- Lista de Pets -->
      <div v-if="!loading && pets.length === 0" class="no-pets-message">
        <p>Você ainda não possui pets cadastrados.</p>
      </div>

      <!-- Grid de Pets -->
      <div v-if="!loading && pets.length > 0" class="pets-grid">
        <div v-for="pet in pets" :key="pet.id" class="pet-card">
          <img
            :src="pet.imageUrl || '/placeholder-pet.jpg'"
            :alt="pet.nome"
            class="pet-image"
          >
          <div class="pet-info">
            <h2 class="pet-name">{{ pet.nome }}</h2>
            <p class="pet-details">
              <span class="detail-label">Raça:</span> {{ pet.raca || 'Não informada' }}
            </p>
            <p class="pet-details">
              <span class="detail-label">Cor:</span> {{ pet.cor }}
            </p>
            <p class="pet-details">
              <span class="detail-label">Gênero:</span> {{ pet.genero }}
            </p>
            <p class="pet-details">
              <span class="detail-label">Porte:</span> {{ pet.porte }}
            </p>
            <div class="pet-actions">
              <button @click="generateQrCode(pet)" class="qr-btn">
                <span class="icon">📱</span> QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal QRCode -->
      <div v-if="showQrModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>QRCode do Pet</h2>
            <button @click="showQrModal = false" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="qrcode-container">
              <qrcode-vue
                :value="qrCodeData"
                :size="200"
                level="H"
                render-as="svg"
              />
            </div>
            <p class="qrcode-info">
              Escaneie este QRCode para acessar o perfil do pet<br>
              <span class="qr-url">{{ qrCodeData }}</span>
            </p>
          </div>
          <div class="modal-footer">
            <button
              @click="showQrModal = false"
              class="modal-btn"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'

export default {
  name: 'MeusPets',
  components: {
    QrcodeVue
  },
  setup() {
    const router = useRouter()
    const auth = getAuth()
    const db = getFirestore()

    const pets = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showQrModal = ref(false)
    const qrCodeData = ref('')

    const fetchPets = async () => {
  try {
    loading.value = true
    error.value = null

    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const userId = auth.currentUser.uid
    console.log('UserID atual:', userId)

    const q = query(
      collection(db, 'Pets'),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(q)
    console.log('Número de documentos encontrados:', querySnapshot.size)

    // Log detalhado de cada documento para debug
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('Documento encontrado:', {
        id: doc.id,
        ...data,
        // Verificar todos os possíveis campos de imagem
        imagemUrl: data.imagemUrl,
        imageUrl: data.imageUrl,
        imagem: data.imagem,
        foto: data.foto
      })
    })

    // Mapear os documentos para o array de pets
    pets.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        nome: data.nome || '',
        raca: data.raca || 'Não informada',
        cor: data.cor || '',
        genero: data.genero || '',
        porte: data.porte || '',
        // Tentar todos os possíveis campos de imagem
        imageUrl: data.imagemUrl || data.imageUrl || data.imagem || data.foto || 'https://placehold.co/300x200?text=Pet'
      }
    })

    console.log('Pets carregados:', pets.value)

  } catch (err) {
    console.error('Erro ao buscar pets:', err)
    error.value = 'Erro ao carregar seus pets. Tente novamente.'
  } finally {
    loading.value = false
  }
}

    const generateQrCode = (pet) => {
      qrCodeData.value = `petconnect.info/pet/${pet.id}`
      showQrModal.value = true
    }

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    }
    onMounted(async () => {
        await fetchPets()
        console.log('Current user:', auth.currentUser?.uid)
        console.log('Loaded pets:', pets.value)
      })

    onMounted(fetchPets)

    return {
      pets,
      loading,
      error,
      showQrModal,
      qrCodeData,
      generateQrCode,
      handleLogout
    }
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.top-nav {
  background-color: #154ABC;
  padding: 1rem;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: white;
  color: #154ABC;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  color: #154ABC;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background: #fff3f3;
  color: #d32f2f;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
}

.no-pets-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.pet-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.pet-card:hover {
  transform: translateY(-5px);
}

.pet-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.pet-info {
  padding: 1.5rem;
}

.pet-name {
  color: #154ABC;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.pet-details {
  margin: 0.5rem 0;
  color: #666;
}

.detail-label {
  font-weight: bold;
  color: #333;
}

.pet-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.qr-btn {
  background: #4CAF50;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qr-btn:hover {
  background: #45a049;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #154ABC;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.qrcode-info {
  text-align: center;
  color: #666;
  margin: 1rem 0;
}

.qr-url {
  color: #154ABC;
  font-size: 0.9rem;
  word-break: break-all;
}

.modal-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-btn {
  background: #154ABC;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn:hover {
  background: #1239a1;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }

  .main-content {
    padding: 1rem;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
