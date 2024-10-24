<template>  
  <div class="home-container">  
    <!-- Hero Section -->  
    <section class="hero-section">  
      <div class="hero-content">  
        <img   
          class="logo-image"   
          src="https://firebasestorage.googleapis.com/v0/b/pet-connect-c53f1.appspot.com/o/imagens%2Flogopetconnect.png?alt=media&token=234db5bb-947f-4b4d-ad4c-8fa656b33ec7"   
          alt="Logo Pet Connect"  
        >  
        <h1 class="main-title">Pet Connect</h1>  
        <p class="tagline">Conectando corações perdidos aos seus lares</p>  
      </div>  
    </section>  

    <!-- About Section -->  
    <section class="about-section">  
      <div class="about-content">  
        <h2 class="section-title">Sobre o Projeto</h2>  
        <p class="about-text">  
          Esta plataforma faz parte de um projeto de TCC dedicado a reunir pets perdidos com seus tutores.  
          Através de uma interface intuitiva, facilitamos a comunicação e o compartilhamento de informações  
          sobre pets desaparecidos, criando uma rede de apoio entre os tutores e a comunidade.  
        </p>  
      </div>  
    </section>  

    <!-- Features Section -->  
    <section class="features-section">  
      <div class="features-grid">  
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
    </section>  
  </div>  
</template>  

<script>  
export default {  
  name: "PetConnect"  
}  
</script>  

<style scoped>  
.home-container {  
  min-height: 100vh;  
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);  
}  

/* Hero Section */  
.hero-section {  
  padding: 4rem 2rem;  
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);  
  color: white;  
  text-align: center;  
}  

.hero-content {  
  max-width: 800px;  
  margin: 0 auto;  
}  

.logo-image {  
  width: 180px;  
  height: 180px;  
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  
  margin-bottom: 1.5rem;  
}  

.main-title {  
  font-size: 3.5rem;  
  font-weight: bold;  
  margin-bottom: 1rem;  
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);  
  transition: all 0.4s ease;  
  display: inline-block;  
  padding: 0.5rem 1rem;  
}  

.main-title:hover {  
  transform: scale(1.15);  
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);  
  letter-spacing: 2px;  
}  

.tagline {  
  font-size: 1.5rem;  
  opacity: 0.9;  
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
}  

.about-text {  
  color: #4b5563;  
  font-size: 1.2rem;  
  line-height: 1.8;  
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
  transition: transform 0.3s ease;  
}  

.feature-card:hover {  
  transform: translateY(-5px);  
}  

.feature-icon {  
  font-size: 3rem;  
  margin-bottom: 1rem;  
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
}  
</style>