<template>
    <div v-if="pet">
        <img v-if="pet.imagemUrl" :src="pet.imagemUrl" alt="Foto do Pet" class="pet-image">
        <h1 class="nomepet">{{ pet.nome }}</h1>
        <p class="dadospet">Cor: {{ pet.cor }}</p>
        <p class="dadospet">Porte: {{ pet.porte }}</p>
        <p class="dadospet">Gênero: {{ pet.genero }}</p>
        <h2 class="nomepet" v-if="dono">Dono: {{ dono.nome }}</h2>
        <p class="dadospet" v-if="dono">Telefone: {{ dono.telefone }}</p>
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
                this.pet.imagemUrl = petDocSnap.data().imagemUrl;  
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
<style scoped>
.nomepet{
    color: blue;
    font-size: 50px;
    text-align: center;
}
.dadospet{
    color: brown;
    font-size: 25px;
    text-align: center

}
.pet-image {  
  display: block;  
  margin: 20px auto;  
  max-width: 300px;  
  border-radius: 10px;  
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);  
}

</style>