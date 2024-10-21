<template>
    <div v-if="pet">
      <h1>{{ pet.nome }}</h1>
      <p>Cor: {{ pet.cor }}</p>
      <p>Porte: {{ pet.porte }}</p>
      <p>Gênero: {{ pet.genero }}</p>
      <h2>Dono: {{ dono.nome }}</h2>
      <p>Telefone: {{ dono.telefone }}</p>
    </div>
  </template>
  
  <script>
  import { db } from '../firebaseConfig';
  
  export default {
    data() {
      return {
        pet: null,
        dono: null
      };
    },
    created() {
      const petId = this.$route.params.petId;
  
      // Busca o pet no Firebase Firestore
      db.collection('Pets').doc(petId).get().then(doc => {
        if (doc.exists) {
          this.pet = doc.data();
          const donoId = this.pet.userId;
  
          // Busca os dados do dono
          db.collection('Usuarios').doc(donoId).get().then(docDono => {
            if (docDono.exists) {
              this.dono = docDono.data();
            }
          });
        }
      });
    }
  };
  </script>