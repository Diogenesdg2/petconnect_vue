<template>  
    <div class="container">  
      <!-- Seção do Pet -->  
      <div v-if="pet" class="card pet-card"> 
        <h1 class="title">Informações do Pet</h1>   
        <h2 class="subtitle">Nome: {{ pet.nome }}</h2>  
        
        <div class="image-container">  
          <img   
            v-if="pet.imagemUrl"   
            :src="pet.imagemUrl"   
            alt="Foto do Pet"   
            class="profile-image"  
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
  
      <!-- Seção do Tutor -->  
      <div v-if="dono" class="card pet-card">  
        <h2 class="subtitle">Informações do Tutor</h2>  
        
        <div class="image-container">  
          <img   
            v-if="dono?.foto"   
            :src="dono.foto"   
            alt="Foto do Tutor"   
            class="profile-image owner-image"  
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
    </div>  
  </template>  
  
  <script>  
  
  import { db } from '../firebaseDB';  
  import { getFirestore, doc, getDoc } from 'firebase/firestore';  
  
  export default {  
    data() {  
      return {  
        pet: null,  
        dono: null,  
        isLoading: true,  
        error: null  
      };  
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
    font-weight: 600;  
    min-width: 80px;  
  }  
  
  .value {  
    color: #202924;  
  }  
  
  .owner-info {  
    background: #90c0c0;   
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