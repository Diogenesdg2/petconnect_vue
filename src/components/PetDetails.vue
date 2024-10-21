<template>
    <div v-if="pet">
      <h1>{{ pet.nome }}</h1>
      <p>Cor: {{ pet.cor }}</p>
      <p>Porte: {{ pet.porte }}</p>
      <p>Gênero: {{ pet.genero }}</p>
      <h2 v-if="dono">Dono: {{ dono.nome }}</h2>
      <p v-if="dono">Telefone: {{ dono.telefone }}</p>
    </div>
  </template>
  
  <script>
        import { db } from '../firebaseDB' ;
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
            // Busca o pet no Firebase Firestore  
            const petDocRef = doc(db, 'Pets', petId);  
            const petDocSnap = await getDoc(petDocRef);  

            if (petDocSnap.exists()) {  
                this.pet = petDocSnap.data();  
                const userId = this.pet.userId;  

                // Busca os dados do dono  
                const userDocRef = doc(db, 'Usuarios', userId);  
                const userDocSnap = await getDoc(userDocRef);  

                if (userDocSnap.exists()) {  
                this.dono = userDocSnap.data();  
                } else {  
                console.log("DOCUMENTO DO USUÁRIO NÃO ENCONTRADO");  
                }  
            } else {  
                console.log("DOCUMENTO DO PET NÃO ENCONTRADO");  
            }  
            } catch (error) {  
            console.error("Erro ao buscar dados:", error);  
            }  
        }  
        };  
  </script>