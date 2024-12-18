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
 <!-- <div>
    <div class="button-container">
      <button @click="enviarAlerta" class="home-button">
        Emitir Alerta
      </button>
    </div>
  </div> -->
</template>

<script>
import { db } from '../firebaseDB';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      pet: null,
      dono: null,
      isLoading: true,
      error: null,
      showModal: false,
      selectedImage: null,
      enviandoAlerta: false
    };
  },
  methods: {
    openModal(imageUrl) {
      this.selectedImage = imageUrl;
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.showModal = false;
      this.selectedImage = null;
      document.body.style.overflow = 'auto';
    },
    goHome() {
      this.$router.push({ name: 'Sobre' });
    },
    // Adicionando o novo método dentro do objeto methods
    async obterESalvarLocalizacao() {
    if (!this.dono?.telefone) {
      console.error('Telefone do tutor não disponível');
      return;
    }

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const localizacao = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          telefone: this.dono.telefone,
          timestamp: serverTimestamp(),
          petId: this.$route.params.PetsId,
          nomePet: this.pet.nome,
          nomeTutor: this.dono.nome
        };

        const db = getFirestore();
        const localizacoesRef = collection(db, 'Localizacoes');
        await addDoc(localizacoesRef, localizacao);

        console.log('Localização salva com sucesso');
      } catch (error) {
        let mensagemErro = 'Erro ao obter localização';

        // Tratamento específico de erros de geolocalização
        if (error.code === 1) {
          mensagemErro = 'Permissão de localização negada. Por favor, permita o acesso à sua localização.';
        } else if (error.code === 2) {
          mensagemErro = 'Localização não disponível no momento.';
        } else if (error.code === 3) {
          mensagemErro = 'Tempo limite excedido ao obter localização.';
        }

        console.error(mensagemErro, error);
        alert(mensagemErro);
      }
    } else {
      const mensagem = 'Geolocalização não é suportada neste navegador.';
      console.error(mensagem);
      alert(mensagem);
    }
  }
},

  async created() {
    const db = getFirestore();
    const petId = this.$route.params.PetsId;

    try {
      const petDocRef = doc(db, 'Pets', petId);
      const petDocSnap = await getDoc(petDocRef);

      if (petDocSnap.exists()) {
        this.pet = petDocSnap.data();
        this.pet.imagemUrl = petDocSnap.data().imagemUrl;
        const userId = this.pet.userId;

        const userDocRef = doc(db, 'Usuarios', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          this.dono = userDocSnap.data();
          this.dono.foto = userDocSnap.data().foto;

          // Chamada do método após carregar os dados
          await this.obterESalvarLocalizacao();
        }
      }
    } catch (error) {
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
  background: #4a76d3;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.home-button:hover {
  background-color: #154ABC;
  transform: scale(1.05);
}


.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px #154ABC;
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
  border: 4px solid #154ABC;
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
  background: #4a76d3;
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
  color: white;

}

.value {
  color: white;
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
  border-top: 5px solid #154ABC;
}

.owner-card {
  background: #fafafa;
  border-top: 5px solid #154ABC;
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

  .alertb {
  background: #4a76d3;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.alertb:hover {
  background-color: #154ABC;
  transform: scale(1.05);
}

}
</style>
