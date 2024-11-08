<template>
  <div class="container">
    <div class="button-container">
      <button @click="goHome" class="home-button">Conheça o Aplicativo</button>
    </div>
    <!-- Card do Pet -->
    <div v-if="pet" class="card pet-card">
      <h2 class="title">Nome: {{ pet.nome }}</h2>

      <div class="image-container">
        <img
          v-if="pet.imagemUrl"
          :src="pet.imagemUrl"
          alt="Foto do Pet"
          class="profile-image"
          @click="openModal(pet.imagemUrl)"
        >
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="label">Raça:</span>
          <span class="value">{{ pet.raca }}</span>
        </div>
        <div class="info-item">
          <span class="label">Cor:</span>
          <span class="value">{{ pet.cor }}</span>
        </div>
        <div class="info-item">
          <span class="label">Porte:</span>
          <span class="value">{{ pet.porte }}</span>
        </div>
        <div class="info-item">
          <span class="label">Gênero:</span>
          <span class="value">{{ pet.genero }}</span>
        </div>
      </div>
    </div>

    <!-- Card do tutor -->
    <div v-if="dono" class="card owner-card">
      <h2 class="subtitle">Informações do Tutor</h2>

      <div class="image-container">
        <img
          v-if="dono?.foto"
          :src="dono.foto"
          alt="Foto do Tutor"
          class="profile-image owner-image"
          @click="openModal(dono.foto)"
        >
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="label">Nome:</span>
          <span class="value">{{ dono.nome }}</span>
        </div>
        <div class="info-item">
          <span class="label">Contato:</span>
          <span class="value">{{ dono.telefone }}</span>
        </div>
      </div>
    </div>

    <!-- utilizando Modal para visualização da imagem -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">&times;</span>
        <img :src="selectedImage" alt="Imagem ampliada" class="modal-image">
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseDB';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Conexão com o firestore

export default {
  data() {
    return {
      pet: null,
      dono: null,
      isLoading: true,
      error: null,
      showModal: false,
      selectedImage: null
    };
  },
  methods: {
    openModal(imageUrl) {
      this.selectedImage = imageUrl;
      this.showModal = true;
      document.body.style.overflow = 'hidden'; // Bloqueio da rolagem
    },
    closeModal() {
      this.showModal = false;
      this.selectedImage = null;
      document.body.style.overflow = 'auto'; // Restaura rolagem
    },
    goHome() {
      this.$router.push({ name: 'Sobre' });
    }
  },
  async created() {
    const db = getFirestore();
    const petId = this.$route.params.PetsId; // Extrair id do pet da rota atual

    try {
      const petDocRef = doc(db, 'Pets', petId); // Cria uma referência para o documento do pet específico no Firestore
      const petDocSnap = await getDoc(petDocRef);

      if (petDocSnap.exists()) { // Verificação se o documento do pet existe
        this.pet = petDocSnap.data(); // Armazenando os dados do pet
        this.pet.imagemUrl = petDocSnap.data().imagemUrl; // Armazenando a imagem
        const userId = this.pet.userId;

        const userDocRef = doc(db, 'Usuarios', userId); // Cria uma referência para o documento do usuário específico em Usuarios
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) { //Se o documento do usuário existir, salva os dados do dono em this.dono e atualiza a foto do dono.
          this.dono = userDocSnap.data();
          this.dono.foto = userDocSnap.data().foto;
        }
      }
    } catch (error) { // Em caso de falha em qualquer parte do código dentro do try, imprime um erro no console com a mensagem "Erro ao buscar dados:"
      console.error("Erro ao buscar dados:", error);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  position: relative;
}
.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.home-button {
  background: hsl(170, 80%, 31%);
  color: black;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.home-button:hover {
  background-color: white;
  transform: scale(1.05);
}


.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.subtitle {
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.image-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.profile-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid hsl(170, 80%, 31%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.owner-image {
  width: 150px;
  height: 150px;
}

.profile-image:hover {
  transform: scale(1.05);
  }

/* Novos estilos para o modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  margin: auto;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: default;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 35px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
}

.close-button:hover {
  color: #90c0c0;

}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background: #90c0c0;
  padding: 1.5rem;
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.label {
  color: black;

}

.value {
  color: #202924;
  font-weight: bold;
  font-size: 18px;
}

.owner-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.pet-card {
  border-top: 5px solid hsl(170, 80%, 31%);
}

.owner-card {
  background: #fafafa;
  border-top: 5px solid hsl(170, 80%, 31%);
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.75rem;
  }

  .profile-image {
    width: 150px;
    height: 150px;
  }

  .owner-image {
    width: 150px;
    height: 150px;
  }
}
</style>
