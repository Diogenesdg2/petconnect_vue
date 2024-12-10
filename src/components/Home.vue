<template>
 <!-- Modificar a div login-form -->
<div class="login-form">
  <div v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
  <input
    type="email"
    placeholder="Email"
    class="login-input"
    v-model="email"
    :disabled="loading"
  >
  <input
    type="password"
    placeholder="Senha"
    class="login-input"
    v-model="password"
    :disabled="loading"
  >
  <button
    class="login-button"
    @click="handleLogin"
    :disabled="loading"
  >
    {{ loading ? 'Entrando...' : 'Entrar' }}
  </button>
  <!--  <button
      class="login-button"
      @click="openRegisterModal"
      :disabled="loading"
    >
      Cadastrar
    </button> -->
</div>

<!-- Adicionar o modal de cadastro -->
<div v-if="showRegisterModal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Cadastro de Usuário</h2>
      <button class="close-button" @click="closeRegisterModal">&times;</button>
    </div>

    <form @submit.prevent="handleRegister" class="register-form">
      <div v-if="successMessage" class="success-message">
          {{ successMessage }}
      </div>
      <div v-if="registerError" class="error-message">
         {{ registerError }}
      </div>

      <!-- Nome -->
      <div class="form-group">
        <input
          type="text"
          v-model="registerForm.nome"
          placeholder="Nome completo"
          required
          class="register-input"
        >
      </div>

      <!-- Email -->
      <div class="form-group">
        <input
          type="email"
          v-model="registerForm.email"
          placeholder="Email"
          required
          class="register-input"
        >
      </div>

      <!-- Senha -->
      <div class="form-group">
        <input
          type="password"
          v-model="registerForm.password"
          placeholder="Senha"
          required
          class="register-input"
        >
      </div>

      <!-- Data de Nascimento -->
      <div class="form-group">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="dataNascimento">
          Data de Nascimento
        </label>
        <input
          type="text"
          id="dataNascimento"
          v-model="registerForm.dataNascimento"
          class="register-input"
          placeholder="Digite a data de nascimento"
        >
      </div>

      <!-- Telefone -->
      <div class="form-group">
        <input
          type="tel"
          v-model="registerForm.telefone"
          placeholder="Telefone"
          required
          class="register-input"
          maxlength="15"
        >
      </div>

      <!-- Gênero -->
      <div class="form-group">
        <select
          v-model="registerForm.genero"
          required
          class="register-input"
        >
          <option value="">Selecione o gênero</option>
          <option value="Homem">Homem</option>
          <option value="Mulher">Mulher</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <!-- Foto -->
      <div class="form-group">
        <label class="file-input-label">
          <span>{{ registerForm.foto ? 'Foto selecionada' : 'Escolher foto' }}</span>
          <input
            type="file"
            @change="handleFileUpload"
            accept="image/*"
            class="file-input"
          >
        </label>
      </div>

      <button
        type="submit"
        class="register-submit-button"
        :disabled="isRegistering"
      >
        <span v-if="isRegistering" class="spinner"></span>
        <span>{{ isRegistering ? 'Cadastrando...' : 'Cadastrar' }}</span>
      </button>
    </form>
  </div>
</div>
   <section class="hero-section">
     <div class="hero-content">
       <img
         class="logo-image"
         src="https://firebasestorage.googleapis.com/v0/b/pet-connect-c53f1.appspot.com/o/imagens%2FLogoNew.png?alt=media&token=b7bc68f5-d033-43e2-a5f5-7211e24df816"
         alt="Logo Pet Connect"
       >
       <h1 class="main-title">Pet Connect</h1>
       <p class="tagline">Conectando corações perdidos aos seus lares</p>
     </div>
   </section>

   <!-- Seção sobre -->
   <section class="about-section">
     <div class="about-content">
       <h2 class="section-title">Sobre o Projeto</h2>
       <p class="about-text">
         Esta plataforma faz parte de um projeto de TCC dedicado a reunir pets perdidos com seus tutores.
         Através de uma interface intuitiva, facilitamos a comunicação e o compartilhamento de informações
         sobre pets desaparecidos, criando assim uma rede de apoio entre os tutores e a comunidade.
       </p>
     </div>
   </section>

   <!-- Início dos cards-->
   <section class="features-section">
     <div class="features-grid">
       <div class="feature-card">
         <div class="feature-icon">⬇️</div>
         <h3>Download do Aplicativo</h3>
         <p>Baixe o aplicativo para poder efetuar a cadastro do seu Pet.</p>
       </div>
       <div class="feature-card">
         <div class="feature-icon">💝</div>
         <h3>Comunidade Unida</h3>
         <p>Uma rede de apoio formada por pessoas comprometidas em ajudar pets perdidos.</p>
       </div>
       <div class="feature-card">
         <div class="feature-icon">📱</div>
         <h3>Fácil de Usar</h3>
         <p>Interface simples e intuitiva para facilitar o registro e busca de pets.</p>
       </div>
     </div>
   </section>  <!-- Final dos cards-->

</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

// Router
const router = useRouter()

// Refs para o formulário
const registerForm = ref({
  nome: '',
  email: '',
  password: '',
  dataNascimento: '',
  telefone: '',
  genero: '',
  foto: ''
})

// Refs para controle de estado
const showRegisterModal = ref(false)
const isRegistering = ref(false)
const registerError = ref('')
const successMessage = ref('')

// Função para gerar UID consistente de 20 caracteres
const generateConsistentUid = () => {
  const timestamp = Date.now().toString(16)
  const randomStr = Math.random().toString(36).substring(2, 15)
  const combined = timestamp + randomStr
  return combined.padEnd(20, '0').substring(0, 20)
}

// Função para validar o formulário
const validateRegisterForm = () => {
  if (!registerForm.value.nome) {
    registerError.value = 'Nome é obrigatório'
    return false
  }

  if (!registerForm.value.email) {
    registerError.value = 'Email é obrigatório'
    return false
  }

  if (!registerForm.value.password) {
    registerError.value = 'Senha é obrigatória'
    return false
  }

  if (registerForm.value.password.length < 6) {
    registerError.value = 'A senha deve ter pelo menos 6 caracteres'
    return false
  }

  if (!registerForm.value.dataNascimento) {
    registerError.value = 'Data de nascimento é obrigatória'
    return false
  }

  if (!registerForm.value.telefone) {
    registerError.value = 'Telefone é obrigatório'
    return false
  }

  return true
}

// Função para formatar a data
const formatDate = (date) => {
  return new Date(date).toISOString()
}

// Função para limpar o formulário
const clearForm = () => {
  registerForm.value = {
    nome: '',
    email: '',
    password: '',
    dataNascimento: '',
    telefone: '',
    genero: '',
    foto: ''
  }
  registerError.value = ''
  successMessage.value = ''
}

// Função principal de registro
const handleRegister = async () => {
  try {
    registerError.value = ''
    successMessage.value = ''

    if (!validateRegisterForm()) {
      return
    }

    isRegistering.value = true

    // Criar usuário no Firebase Auth
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      registerForm.value.email,
      registerForm.value.password
    )

    // Gerar UID consistente
    const consistentUid = generateConsistentUid()

    // Salvar dados no Firestore
    const db = getFirestore()
    await addDoc(collection(db, 'Usuarios'), {
      uid: consistentUid,
      nome: registerForm.value.nome,
      email: registerForm.value.email,
      dataNascimento: formatDate(registerForm.value.dataNascimento),
      telefone: registerForm.value.telefone,
      genero: registerForm.value.genero || '',
      foto: registerForm.value.foto || '',
      dataCadastro: new Date().toISOString()
    })

    // Mostrar mensagem de sucesso
    successMessage.value = 'Cadastro realizado com sucesso! Redirecionando...'

    // Limpar formulário
    clearForm()

    // Redirecionar após delay
    setTimeout(() => {
      showRegisterModal.value = false
      router.push('/cadastro-pets')
    }, 1500)

  } catch (error) {
    console.error('Erro no cadastro:', error)

    switch (error.code) {
      case 'auth/email-already-in-use':
        registerError.value = 'Este email já está cadastrado. Por favor, use outro email ou faça login.'
        break
      case 'auth/invalid-email':
        registerError.value = 'Email inválido. Por favor, verifique o formato do email.'
        break
      case 'auth/operation-not-allowed':
        registerError.value = 'Cadastro com email e senha não está habilitado.'
        break
      case 'auth/weak-password':
        registerError.value = 'A senha é muito fraca. Use pelo menos 6 caracteres.'
        break
      case 'auth/network-request-failed':
        registerError.value = 'Erro de conexão. Verifique sua internet e tente novamente.'
        break
      default:
        registerError.value = 'Erro ao realizar cadastro. Por favor, tente novamente.'
    }
  } finally {
    isRegistering.value = false
  }
}

// Função para abrir o modal
const openRegisterModal = () => {
  showRegisterModal.value = true
  clearForm()
}

// Função para fechar o modal
const closeRegisterModal = () => {
  showRegisterModal.value = false
  clearForm()
}

// Funções para manipulação de foto (se necessário)
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Adicione aqui a lógica para upload de arquivo
    // Por exemplo, converter para base64 ou enviar para storage
  }
}

// Lifecycle hooks
onMounted(() => {
  // Adicione aqui qualquer inicialização necessária
})

// Expor funções e refs para o template
defineExpose({
  showRegisterModal,
  registerForm,
  registerError,
  successMessage,
  isRegistering,
  handleRegister,
  openRegisterModal,
  closeRegisterModal,
  handleFileUpload
})
</script>
<style scoped>

.login-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.login-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.login-input {
  width: 200px;
  padding: 0.5rem 1rem;
  border: 4px solid #154ABC;
  border-radius: 20px;
  background: white;
  color: black;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-input::placeholder {
  color: black;
}

.login-input:focus {
  outline: none;
  border-color: #004d40;
  background: rgba(255, 255, 255, 0.2);
}

.login-button {
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

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: #154ABC;
}

/* Media query atualizado */
@media (max-width: 768px) {
  .login-form {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .login-input {
    width: 100%;
  }

  .login-button {
    width: 100%;
  }

.login-input:disabled,
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button:disabled:hover {
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
}
.error-message {
  background: #154ABC;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  backdrop-filter: blur(5px);
}

.login-input:disabled,
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button:disabled:hover {
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.home-container {
 min-height: 100vh;
 background: linear-gradient(to bottom, #8cf1d3, #154ABC);
 animation: pageLoad 0.5s ease-out;
}

/* Hero Section */
.hero-section {
 padding: 4rem 2rem;
 background: linear-gradient(360deg,
   #154ABC 100%,
   #4fcea8 50%,
   #154ABC 100%
 );
 color: white;
 text-align: center;
 position: relative;
 overflow: hidden;
}

.hero-section::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: linear-gradient(#90c0c0, rgba(0,0,0,0.2));
 z-index: 1;
}

.hero-content {
 max-width: 800px;
 margin: 0 auto;
 position: relative;
 z-index: 2;
}

.logo-image {
 width: 180px;
 height: 180px;
 border-radius: 50%;

 margin-bottom: 1.5rem;
 transition: transform 0.3s ease;
}

.logo-image:hover {
 transform: scale(1.05);
}

@keyframes titlePulse {
 0% {
   transform: scale(1);
   color: white;
 }

 50% {
   transform: scale(1.1);
   color: #e6ffe6;
 }

 100% {
   transform: scale(1);
   color: white;
 }
}

.main-title {
 font-family: poppins;
 font-size: 3.5rem;
 font-weight: bold;
 margin-bottom: 1rem;
 display: inline-block;
 padding: 0.5rem 1rem;
 cursor: pointer;
 animation: titlePulse 2s ease-in-out infinite;
 position: relative;
 letter-spacing: 2px;
 text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.tagline {
 font-size: 1.5rem;
 opacity: 0.9;
 animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
 from {
   opacity: 0;
   transform: translateY(20px);
 }
 to {
   opacity: 0.9;
   transform: translateY(0);
 }
}

/* About Section */
.about-section {
 padding: 4rem 2rem;
 background: white;
}

.about-content {
 max-width: 800px;
 margin: 0 auto;
 text-align: center;
}

.section-title {
 color: #2c3e50;
 font-size: 2rem;
 margin-bottom: 1.5rem;
 position: relative;
 display: inline-block;
}

.section-title::after {
 content: '';
 position: absolute;
 bottom: -10px;
 left: 50%;
 transform: translateX(-50%);
 width: 50px;
 height: 3px;
 background: linear-gradient(to right, #004d40, #00695c);
 border-radius: 2px;
}

.about-text {
 color: #4b5563;
 font-size: 1.2rem;
 line-height: 1.8;
 animation: slideIn 1s ease-out;
}

@keyframes slideIn {
 from {
   opacity: 0;
   transform: translateX(-20px);
 }
 to {
   opacity: 1;
   transform: translateX(0);
 }
}

/* Features Section */
.features-section {
 padding: 4rem 2rem;
 background: #f8f9fa;
}

.features-grid {
 max-width: 800px;
 margin: 0 auto;
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
 gap: 2rem;
 padding: 0 1rem;
}

.feature-card {
 background: white;
 padding: 2rem;
 border-radius: 15px;
 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
 text-align: center;
 transition: all 0.3s ease;
 position: relative;
 overflow: hidden;
}

.feature-card::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 height: 4px;
 background: linear-gradient(to right, #004d40, #00695c);
 transform: scaleX(0);
 transition: transform 0.3s ease;
}

.feature-card:hover {
 transform: translateY(-5px);
 box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
 transform: scaleX(1);
}

.feature-icon {
 font-size: 3rem;
 margin-bottom: 1rem;
 transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
 transform: scale(1.1);
}

.feature-card h3 {
 color: #2c3e50;
 font-size: 1.5rem;
 margin-bottom: 1rem;
}

.feature-card p {
 color: #4b5563;
}

/* Responsive Design */
@media (max-width: 768px) {
 .main-title {
   font-size: 2.5rem;
 }

 .tagline {
   font-size: 1.2rem;
 }

 .logo-image {
   width: 150px;
   height: 150px;
 }

 .features-grid {
   grid-template-columns: 1fr;
 }

 .about-text {
   font-size: 1.1rem;
 }

 .feature-card {
   margin: 0 1rem;
 }
}

@keyframes pageLoad {
 from {
   opacity: 0;
 }
 to {
   opacity: 1;
 }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  transition: opacity 0.3s ease;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalIn 0.3s ease-out;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  color: #154ABC;
  font-size: 1.5rem;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  position: relative;
}

.register-input {
  width: 100%;
  color:black;
  padding: 0.8rem 1rem;
  border: 2px solid #154ABC;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.register-input:focus {
  color:black;
  outline: none;
  border-color: #004d40;
  box-shadow: 0 0 0 2px rgba(0, 77, 64, 0.1);
}

.file-input-label {
  display: block;
  padding: 0.8rem 1rem;
  color:white;
  background: #1a76d3;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.file-input-label:hover {
  background: #154ABC;
}

.file-input {
  display: none;
}

.register-submit-button {
  background: #1a76d3;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-submit-button:hover {
  background: #154ABC;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
  .register-input.error {
  border-color: #dc3545;
}

.error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
}

.error-message {
  background: #fde8e8;
  color: #e53e3e;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: 1px solid #f8b4b4;
}

.register-input.error {
  border-color: #e53e3e;
}

.register-input:focus.error {
  box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.1);
}

.success-message {
  background: #e6ffed;
  color: #0a5c36;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: 1px solid #b7eb8f;
  text-align: center;
}

/* Animação de fade para as mensagens */
.success-message, .error-message {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
