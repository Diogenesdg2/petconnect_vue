<template>
    <div v-if="pet">
      <h1>{{ Pets.nome }}</h1>
      <p>Cor: {{ Pets.cor }}</p>
      <p>Porte: {{ Pets.porte }}</p>
      <p>Gênero: {{ Pets.genero }}</p>
      <h2>Dono: {{ dono.nome }}</h2>
      <p>Telefone: {{ dono.telefone }}</p>
    </div>
  </template>
  
  <script>
  import { db } from '../firebaseConfig';
  
  export default {
    data() {
      return {
        Pets: null,
        dono: null
      };
    },
    created() {
      const PetsId = this.$route.params.petsId;
  
      // Busca o pet no Firebase Firestore
      db.collection('Pets').doc(PetsId).get().then(doc => {
        if (doc.exists) {
          this.Pets = doc.data();
          const userId = this.Pets.userId;
  
          // Busca os dados do dono
          db.collection('Usuarios').doc(userId).get().then(docDono => {
            if (docDono.exists) {
              this.dono = docDono.data();
            }
          });
        }
      });
    }
  };
  </script>