<template>
  <div class="app-container">
    <!-- Menu Superior -->
    <nav class="top-nav">
      <div class="nav-content">
        <div class="logo">PetConnect</div>
        <div class="nav-links">
          <router-link to="/meus-pets" class="logout-btn">
            <span class="icon">🏠</span> Meus Pets
          </router-link>
          <button @click="handleLogout" class="logout-btn">
            <span class="icon">🚪</span> Sair
          </button>
        </div>
      </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <h1 class="page-title">Cadastrar Novo Pet</h1>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit" class="pet-form">
        <!-- Upload de Imagem -->
        <div class="image-upload">
          <div
            class="image-preview"
            @click="triggerImageUpload"
            :class="{ 'has-image': imagePreview }"
          >
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Preview"
              class="preview-img"
            >
            <div v-else class="upload-placeholder">
              <span class="icon">📷</span>
              <p>Clique para adicionar uma foto</p>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleImageSelect"
            accept="image/*"
            class="hidden-input"
          >
        </div>

        <!-- Campos do Formulário -->
        <div class="form-grid">
          <div class="form-group">
            <label for="nome">Nome do Pet*</label>
            <input
              id="nome"
              v-model="nome"
              type="text"
              required
              placeholder="Digite o nome do pet"
            >
          </div>

          <div class="form-group">
            <label for="raca">Raça</label>
            <input
              id="raca"
              v-model="raca"
              type="text"
              placeholder="Digite a raça"
            >
          </div>

          <div class="form-group">
            <label for="cor">Cor*</label>
            <input
              id="cor"
              v-model="cor"
              type="text"
              required
              placeholder="Digite a cor"
            >
          </div>

          <div class="form-group">
            <label for="genero">Gênero*</label>
            <select id="genero" v-model="genero" required>
              <option value="">Selecione o gênero</option>
              <option value="Macho">Macho</option>
              <option value="Fêmea">Fêmea</option>
            </select>
          </div>

          <div class="form-group">
            <label for="porte">Porte*</label>
            <input
              id="porte"
              v-model="porte"
              type="text"
              required
              placeholder="Digite o porte do pet"
            >
          </div>

          <div class="form-group">
            <label for="peso">Peso (kg)</label>
            <input
              id="peso"
              v-model="peso"
              type="number"
              step="0.1"
              min="0"
              placeholder="Digite o peso"
            >
          </div>

          <div class="form-group">
            <label for="dataNascimento">Data de Nascimento</label>
            <input
              id="dataNascimento"
              v-model="dataNascimento"
              type="date"
            >
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button
            type="button"
            @click="$router.push('/meus-pets')"
            class="cancel-btn"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="submit-btn"
            :disabled="loading"
          >
            {{ loading ? 'Cadastrando...' : 'Cadastrar Pet' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

export default {
  name: 'CadastroPets',
  setup() {
    const router = useRouter()
    const auth = getAuth()
    const storage = getStorage()
    const db = getFirestore()

    // Refs para os campos do formulário
    const nome = ref('')
    const raca = ref('')
    const cor = ref('')
    const genero = ref('')
    const porte = ref('')
    const peso = ref('')
    const dataNascimento = ref('')

    // Refs para upload de imagem
    const fileInput = ref(null)
    const selectedImage = ref(null)
    const imagePreview = ref(null)

    // Estados
    const loading = ref(false)
    const error = ref(null)

    const triggerImageUpload = () => {
      fileInput.value.click()
    }

    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5000000) { // 5MB limit
          error.value = 'A imagem deve ter no máximo 5MB'
          return
        }
        selectedImage.value = file
        imagePreview.value = URL.createObjectURL(file)
      }
    }

    const handleSubmit = async () => {
      try {
        loading.value = true
        error.value = null

        if (!auth.currentUser) {
          throw new Error('Usuário não autenticado')
        }

        let imagemUrl = null
        if (selectedImage.value) {
          const imageRef = storageRef(
            storage,
            `pets/${auth.currentUser.uid}/${Date.now()}_${selectedImage.value.name}`
          )
          await uploadBytes(imageRef, selectedImage.value)
          imagemUrl = await getDownloadURL(imageRef)
        }

        const petData = {
          nome: nome.value,
          raca: raca.value,
          cor: cor.value,
          genero: genero.value,
          porte: porte.value,
          peso: peso.value || null,
          dataNascimento: dataNascimento.value,
          imagemUrl,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        }

        await addDoc(collection(db, 'Pets'), petData)
        router.push('/meus-pets')
      } catch (err) {
        console.error('Erro ao cadastrar pet:', err)
        error.value = 'Erro ao cadastrar pet. Tente novamente.'
      } finally {
        loading.value = false
      }
    }

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    }

    return {
      // Campos do formulário
      nome,
      raca,
      cor,
      genero,
      porte,
      peso,
      dataNascimento,

      // Upload de imagem
      fileInput,
      imagePreview,
      triggerImageUpload,
      handleImageSelect,

      // Estados e ações
      loading,
      error,
      handleSubmit,
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
  border-radius: 20px;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: white;
  color: #154ABC;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  color: #154ABC;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.error-message {
  background: #fff3f3;
  color: #d32f2f;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
}

.pet-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-upload {
  margin-bottom: 2rem;
}

.image-preview {
  width: 200px;
  height: 200px;
  border: 2px dashed #154ABC;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin: 0 auto;
  transition: all 0.3s;
}

.image-preview:hover {
  background-color: #f0f5ff;
}

.image-preview.has-image {
  border-style: solid;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  text-align: center;
  color: #154ABC;
}

.upload-placeholder .icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hidden-input {
  display: none;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  color:black;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
  color: #333;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #154ABC;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: none;
  border-radius: 20px;
  border: 1px solid #666;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.submit-btn {
  background: #154ABC;
  border-radius: 20px;
  border: none;
  color: white;
}

.submit-btn:hover {
  background: #1239a1;
}

.submit-btn:disabled, .cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .image-preview {
    width: 100%;
    max-width: 200px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
