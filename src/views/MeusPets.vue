<template>
  <div class="app-container">
    <!-- Menu Superior -->
    <nav class="top-nav">
      <div class="nav-content">
        <div class="logo">PetConnect</div>
        <div class="nav-links">  
          <router-link to="/dashboard" class="logout-btn">  
            <span class="icon">📍</span> Localizações  
          </router-link>  
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
              <button @click="generateQrCode(pet)" class="action-btn qr-btn">
                <span class="icon">📱</span> QR Code
              </button>
              <button @click="openEditModal(pet)" class="action-btn edit-btn">
                <span class="icon">✏️</span> Editar
              </button>
              <button @click="confirmDelete(pet)" class="action-btn delete-btn">
                <span class="icon">🗑️</span> Excluir
              </button>
              <button @click="sharePet(pet)" class="action-btn share-btn">
                <span class="icon">📤</span> Compartilhar
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
        <!-- Modal de Edição -->
<div v-if="showEditModal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Editar Pet</h2>
      <button @click="closeEditModal" class="close-btn">&times;</button>
    </div>
    <form @submit.prevent="updatePet" class="edit-form">
      <div class="form-image">
        <img
          :src="editingPet?.previewUrl || editingPet?.imageUrl || '/placeholder-pet.jpg'"
          alt="Preview"
          class="preview-image"
        >
        <label class="image-upload-btn">
          Trocar Imagem
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageChange"
          >
        </label>
      </div>
      <div class="form-fields">
      <div class="form-group">
        <label>Nome</label>
        <input
          type="text"
          v-model="editingPet.nome"
          required
          placeholder="Nome do pet"
        >
      </div>
      <br>
      <div class="form-group">
        <label>Raça</label>
        <input
          type="text"
          v-model="editingPet.raca"
          required
          placeholder="Raça do pet"
        >
      </div>
      <br>
      <div class="form-group">
        <label>Cor</label>
        <input
          type="text"
          v-model="editingPet.cor"
          required
          placeholder="Cor do pet"
        >
      </div>
      <br>
      <div class="form-group">
        <label>Gênero</label>
        <select v-model="editingPet.genero" required>
          <option value="">Selecione o gênero</option>
          <option value="Macho">Macho</option>
          <option value="Fêmea">Fêmea</option>
        </select>
      </div>
      <br>
      <div class="form-group">
        <label>Porte</label>
        <select v-model="editingPet.porte" required>
          <option value="">Selecione o porte</option>
          <option value="Pequeno">Pequeno</option>
          <option value="Médio">Médio</option>
          <option value="Grande">Grande</option>
        </select>
      </div>
    </div>
    <br>

        <div class="modal-footer">
          <button
            type="button"
            @click="closeEditModal"
            class="cancel-btn"
            :disabled="updating"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="save-btn"
            :disabled="updating"
          >
            {{ updating ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>

<!-- Modal de Confirmação de Exclusão -->
        <div v-if="showDeleteModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button @click="cancelDelete" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
              <p>Tem certeza que deseja excluir o pet "{{ petToDelete?.nome }}"?</p>
              <p class="warning-text">Esta ação não pode ser desfeita.</p>
            </div>
            <div class="modal-footer">
              <button @click="cancelDelete" class="cancel-btn">
                Cancelar
              </button>
              <button @click="deletePet" class="delete-btn" :disabled="deleting">
                {{ deleting ? 'Excluindo...' : 'Confirmar Exclusão' }}
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
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'
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
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
    const editingPet = ref(null)
    const petToDelete = ref(null)
    const updating = ref(false)
    const deleting = ref(false)
    const updateError = ref(null)
    const newImage = ref(null)

    const openEditModal = (pet) => {
  editingPet.value = { ...pet }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingPet.value = null
  newImage.value = null
  updateError.value = null
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.includes('image/')) {
    alert('Por favor, selecione apenas arquivos de imagem.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('A imagem deve ter no máximo 5MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    editingPet.value.previewUrl = e.target.result
  }
  reader.readAsDataURL(file)

  newImage.value = file
}

const updatePet = async () => {
  if (!editingPet.value) return

  try {
    updating.value = true
    updateError.value = null

    const storage = getStorage()
    const petRef = doc(db, 'Pets', editingPet.value.id)
    let updateData = { ...editingPet.value }

    // Se houver nova imagem, fazer upload
    if (newImage.value) {
      // Deletar imagem antiga se existir
      if (editingPet.value.imageUrl) {
        try {
          const oldImageRef = storageRef(storage, editingPet.value.imageUrl)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.error('Erro ao deletar imagem antiga:', error)
        }
      }

      // Upload da nova imagem
      const imageRef = storageRef(storage, `pets/${auth.currentUser.uid}/${Date.now()}_${newImage.value.name}`)
      await uploadBytes(imageRef, newImage.value)
      const imageUrl = await getDownloadURL(imageRef)
      updateData.imageUrl = imageUrl
    }

    // Remover campos desnecessários
    delete updateData.previewUrl

    // Atualizar no Firestore
    await updateDoc(petRef, updateData)

    // Atualizar lista local
    const index = pets.value.findIndex(p => p.id === editingPet.value.id)
    if (index !== -1) {
      pets.value[index] = { ...updateData }
    }

    // Mostrar mensagem de sucesso
    alert('Pet atualizado com sucesso!')

    // Fechar modal
    closeEditModal()

  } catch (error) {
    console.error('Erro ao atualizar pet:', error)
    updateError.value = 'Erro ao salvar as alterações. Tente novamente.'
    alert('Erro ao salvar as alterações. Tente novamente.')
  } finally {
    updating.value = false
  }
}

const confirmDelete = (pet) => {
  petToDelete.value = pet
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  petToDelete.value = null
}

const deletePet = async () => {
  if (!petToDelete.value) return

  try {
    deleting.value = true

    // Deletar imagem se existir
    if (petToDelete.value.imageUrl) {
      const storage = getStorage()
      try {
        const imageRef = storageRef(storage, petToDelete.value.imageUrl)
        await deleteObject(imageRef)
      } catch (error) {
        console.error('Erro ao deletar imagem:', error)
      }
    }

    // Deletar documento
    await deleteDoc(doc(db, 'Pets', petToDelete.value.id))

    // Atualizar lista local
    pets.value = pets.value.filter(p => p.id !== petToDelete.value.id)

    // Fechar modal
    cancelDelete()

  } catch (error) {
    console.error('Erro ao excluir pet:', error)
    alert('Erro ao excluir o pet. Tente novamente.')
  } finally {
    deleting.value = false
  }
}

const sharePet = async (pet) => {
  if (!navigator.share) {
    alert('Seu navegador não suporta compartilhamento.')
    return
  }

  try {
    const petUrl = `https://petconnect.info/pet/${pet.id}`

    await navigator.share({
      title: `Pet: ${pet.nome}`,
      text: `Confira meu pet ${pet.nome}!\nRaça: ${pet.raca}\nCor: ${pet.cor}\nGênero: ${pet.genero}\nPorte: ${pet.porte}`,
      url: petUrl
    })
  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    // Opcional: mostrar mensagem de erro para o usuário
    if (error.name !== 'AbortError') { // Ignora erro quando usuário cancela compartilhamento
      alert('Erro ao compartilhar. Tente novamente.')
    }
  }
}

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
      handleLogout,
      showEditModal,
      showDeleteModal,
      editingPet,
      petToDelete,
      updating,
      deleting,
      openEditModal,
      closeEditModal,
      handleImageChange,
      updatePet,
      confirmDelete,
      cancelDelete,
      deletePet,
      sharePet
    }
  }
}
</script>

<style scoped>

/* Adicione ao seu <style scoped> existente */

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 20px;
  background: #4a76d3;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn:hover:not(:disabled) {
  background: #154ABC;
}

.save-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 20px;
  background: #4a76d3;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.save-btn:hover:not(:disabled) {
  background: #154ABC;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Adicione uma animação de loading para feedback visual */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.updating {
  position: relative;
  padding-left: 2rem;
}

.updating::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  color: white;
}

.edit-btn {
  border-radius: 20px;
  background: #FFA000;
}

.edit-btn:hover {
  border-radius: 20px;
  background: #FF8F00;
}

.delete-btn {
  border-radius: 20px;
  background: #D32F2F;
}

.delete-btn:hover {
  border-radius: 20px;
  background: #C62828;
}

.share-btn {
  border-radius: 20px;
  background: #7B1FA2;
}

.share-btn:hover {
  background: #6A1B9A;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload-btn {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #4a76d3; /* Cor azul semitransparente */
  color: white; /* Texto branco */
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500; /* Texto um pouco mais bold */
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.8); /* Borda branca */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Sombra suave */
}

.image-upload-btn:hover {
  background: rgba(21, 74, 188, 1); /* Azul sólido no hover */
  transform: translateX(-50%) scale(1.05); /* Pequeno efeito de zoom */
}

/* Estilo para o input file (mantém escondido) */
.image-upload-btn input[type="file"] {
  display: none;
}

.form-fields {
  display: flex;
  flex-direction: column; /* Campos em coluna */
  gap: 1rem; /* Espaçamento entre os campos */
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Espaçamento entre label e input */
}

.form-group label {
  font-weight: 500;
  color: #1a1a1a;
}

.form-group input,
.form-group select {
  padding: 0.75rem; /* Aumentei um pouco o padding para melhor visibilidade */
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s;
  color: #000000;
  background-color: #ffffff;
  font-size: 1rem;
  width: 100%; /* Garante que o input ocupe toda a largura */
}

.form-group input::placeholder {
  color: #666666;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #154ABC;
  outline: none;
}

.form-group select option {
  color: #000000;
  background-color: #ffffff;
}
/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .form-group input,
  .form-group select {
    padding: 0.5rem;
  }
}

/* Ajuste do footer do modal */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}


.warning-text {
  color: #D32F2F;
  margin-top: 0.5rem;
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }

  .pet-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

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
  border-radius: 20px;
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
  border-radius: 20px;
  color: white;
  padding: 0.75rem 1.5rem;
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
  width: 500px; /* Largura fixa mais adequada para formulário em coluna */
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
  border-radius: 20px;
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
  border-radius: 20px;
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
