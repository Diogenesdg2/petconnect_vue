<script setup>
import { RouterView } from 'vue-router'

</script>

<template>
  <header>
    <div class="wrapper">     
      <RouterLink to="./" class="download">Download</RouterLink>      
    </div>
    <img alt="Vue logo" class="logo" src="@/assets/logo.jpeg" width="125" height="125" />
    </header>

  <RouterView />
</template>

<style scoped>
.download{
  text-align: center;
  font-size: 30px;
}
</style>
