<template>
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="#">
          <i class="fas fa-bus text-primary fs-3 me-2"></i>
          <span class="fw-bold fs-4">SchoolTrack</span>
        </a>
        <button class="navbar-toggler" type="-button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#features">Características</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#how-it-works">Cómo Funciona</a>
            </li>
            <li class="nav-item ms-lg-3 mt-3 mt-lg-0">
              <router-link to="/login" class="btn btn-outline-primary px-4 rounded-pill me-2">Entrar</router-link>
            </li>
            <li class="nav-item mt-2 mt-lg-0">
              <router-link to="/register" class="btn btn-primary px-4 rounded-pill shadow-sm">Registrarse</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section text-center text-lg-start d-flex align-items-center">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-5 mb-lg-0">
            <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3 fw-medium">Transporte Escolar Inteligente</span>
            <h1 class="display-4 fw-bold text-dark mb-4 leading-tight">
              La seguridad de tus hijos en <span class="text-primary">tiempo real</span>
            </h1>
            <p class="lead text-secondary mb-5 pe-lg-5">
              Plataforma integral para colegios, padres y conductores. Rastrea el transporte escolar, recibe notificaciones al instante y gestiona rutas de forma eficiente y segura.
            </p>
            <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <router-link to="/register" class="btn btn-primary btn-lg rounded-pill px-5 shadow">
                Comenzar Gratis
              </router-link>
              <a href="#features" class="btn btn-light btn-lg rounded-pill px-5 border">
                Ver Características
              </a>
            </div>
            
            <div class="mt-5 d-flex align-items-center justify-content-center justify-content-lg-start gap-4">
              <div class="d-flex flex-column">
                <h3 class="fw-bold mb-0">99.9%</h3>
                <span class="text-muted small">Uptime Garantizado</span>
              </div>
              <div class="vr"></div>
              <div class="d-flex flex-column">
                <h3 class="fw-bold mb-0">256-bit</h3>
                <span class="text-muted small">Cifrado de Datos</span>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="position-relative">
              <div class="blob-shape bg-primary opacity-10 position-absolute top-50 start-50 translate-middle" style="width: 120%; height: 120%; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; z-index: -1;"></div>
              <img src="https://images.unsplash.com/photo-1554672408-730436b60dde?auto=format&fit=crop&w=800&q=80" alt="Transporte Escolar" class="img-fluid rounded-4 shadow-lg border border-white border-4" style="object-fit: cover; height: 500px; width: 100%;">
              
              <!-- Floating Card -->
              <div class="floating-card bg-white p-3 rounded-3 shadow position-absolute bottom-0 start-0 translate-middle-y ms-n4 d-none d-md-flex align-items-center gap-3 border border-light">
                <div class="icon-circle bg-success-subtle text-success d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px;">
                  <i class="fas fa-check-circle fs-4"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">Juan llegó al colegio</h6>
                  <small class="text-muted">Justo ahora</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-5 bg-light">
      <div class="container py-5">
        <div class="text-center mb-5 pb-3">
          <h2 class="fw-bold text-dark mb-3">Todo lo que necesitas en una app</h2>
          <p class="text-secondary mx-auto" style="max-width: 600px;">
            Diseñado específicamente para las necesidades de escuelas modernas, brindando paz mental a los padres y eficiencia a los conductores.
          </p>
        </div>

        <div class="row g-4">
          <!-- Feature 1 -->
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm feature-card p-4">
              <div class="card-body">
                <div class="feature-icon bg-primary-subtle text-primary mb-4 rounded-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                  <i class="fas fa-map-marked-alt fs-3"></i>
                </div>
                <h4 class="fw-bold mb-3">Rastreo GPS en Vivo</h4>
                <p class="text-muted mb-0">Visualiza la ubicación exacta del autobús escolar en tiempo real. Nunca más esperes bajo la lluvia sin saber cuándo llegará.</p>
              </div>
            </div>
          </div>
          
          <!-- Feature 2 -->
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm feature-card p-4">
              <div class="card-body">
                <div class="feature-icon bg-success-subtle text-success mb-4 rounded-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                  <i class="fas fa-qrcode fs-3"></i>
                </div>
                <h4 class="fw-bold mb-3">Control por Código QR</h4>
                <p class="text-muted mb-0">Cada estudiante cuenta con un QR único. Los conductores escanean al subir y bajar, generando un registro preciso y automático de asistencia.</p>
              </div>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm feature-card p-4">
              <div class="card-body">
                <div class="feature-icon bg-warning-subtle text-warning mb-4 rounded-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                  <i class="fas fa-bell fs-3"></i>
                </div>
                <h4 class="fw-bold mb-3">Alertas Inmediatas</h4>
                <p class="text-muted mb-0">Recibe notificaciones automáticas en tu celular cuando el autobús esté cerca de la parada o cuando tu hijo llegue al colegio.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
      <div class="container text-center">
        <div class="d-flex align-items-center justify-content-center mb-4">
          <i class="fas fa-bus text-primary fs-2 me-2"></i>
          <span class="fw-bold fs-3">SchoolTrack</span>
        </div>
        <p class="text-secondary mb-0">© 2026 SchoolTrack. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Landing page uses standard bootstrap styling, logic is minimal
</script>

<style scoped>
.landing-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.hero-section {
  min-height: calc(100vh - 76px);
  padding: 4rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
  overflow: hidden;
}

.leading-tight {
  line-height: 1.2;
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.1)!important;
}

.bg-primary-subtle { background-color: #e0e7ff !important; }
.bg-success-subtle { background-color: #d1fae5 !important; }
.bg-warning-subtle { background-color: #fef3c7 !important; }

.floating-card {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(-50%) translateY(0px); }
  50% { transform: translateY(-50%) translateY(-10px); }
  100% { transform: translateY(-50%) translateY(0px); }
}
</style>
