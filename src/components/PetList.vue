<template>
  <div class="container">
    <h1 class="title">Lista de Pets</h1>
    <div v-if="isLoading" class="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-if="pets && pets.length" class="pet-list">
      <li v-for="pet in pets" :key="pet.id" class="pet-item">
        <img v-if="pet.imagemUrl" :src="pet.imagemUrl" alt="Foto do Pet" class="pet-image" />
        <div class="pet-info">
          <h2>{{ pet.nome }}</h2>
          <p>Raça: {{ pet.raca }}</p>
          <p>Cor: {{ pet.cor }}</p>
          <p>Porte: {{ pet.porte }}</p>
          <p>Gênero: {{ pet.genero }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default {
  data() {
    return {
      pets: [],
      isLoading: true,
      error: null
    };
  },
  async created() {
    const db = getFirestore();

    try {
      const querySnapshot = await getDocs(collection(db, 'Pets'));
      const petsData = [];
      querySnapshot.forEach((doc) => {
        petsData.push({ id: doc.id, ...doc.data() }); // Adiciona o id do documento ao objeto
      });
      this.pets = petsData;
    } catch (error) {
      this.error = 'Erro ao buscar dados dos pets: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 10px;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
  color: #7f8c8d;
}

.error {
  text-align: center;
  font-size: 1.5rem;
  color: #e74c3c;
}

.pet-list {
  list-style: none;
  padding: 0;
}

.pet-item {
  display: flex;
  align-items: center;
  background: white;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pet-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.pet-info {
  flex-grow: 1;
}

.pet-info h2 {
  margin: 0;
  color: #34495e;
}

.pet-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}
</style>
