<script>
    // Conexion a scripts
</script>

<section class="py-5 text-center shadow-lg rounded-4 mb-5 mt-3 border border-secondary" style="background: linear-gradient(145deg, #1e293b, #0f172a);">
    <div class="row py-lg-5">
        <div class="col-lg-7 col-md-9 mx-auto">
            <i class="bi bi-terminal-fill display-1 text-info mb-4"></i>
            <h1 class="fw-bold display-3 text-white">Wison <span class="text-info">Compiler</span></h1>
            <p class="lead text-slate-300 mt-3 px-4">
                Bienvenido a la plataforma donde puedes generar analizadores sintácticos descendentes. 
                Diseña gramáticas complejas, y genera pruebas para verificar 
                tu lógica. Todo desde tu navegador.
            </p>
            <div class="mt-5">
                <a href="/editor" class="btn btn-info btn-lg px-5 py-3 fw-bold shadow-lg text-uppercase">
                    <i class="bi bi-play-circle-fill me-2"></i> IR AL EDITOR
                </a>
            </div>
        </div>
    </div>
</section>

<div class="row g-4 py-5">
    <div class="col-md-4">
        <div class="card h-100 border-secondary bg-slate-800 text-white shadow-sm p-3" style="background-color: #1e293b;">
            <div class="card-body">
                <div class="feature-icon bg-info bg-gradient text-dark rounded-3 mb-3 d-inline-flex align-items-center justify-content-center px-3 py-2">
                    <i class="bi bi-lightning-charge-fill fs-3"></i>
                </div>
                <h3 class="fw-bold">Lenguaje Wison</h3>
                <p class="text-secondary">Genera tus propios ASD gracias al lenguaje Wison. Puedes generar analizadores léxicos y sintacticos a medida.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100 border-secondary bg-slate-800 text-white shadow-sm p-3" style="background-color: #1e293b;">
            <div class="card-body">
                <div class="feature-icon bg-success bg-gradient text-white rounded-3 mb-3 d-inline-flex align-items-center justify-content-center px-3 py-2">
                    <i class="bi bi-file-earmark-code-fill fs-3"></i>
                </div>
                <h3 class="fw-bold">Motor Jison 0.4.18</h3>
                <p class="text-secondary">Utilizamos el estandar de la industria LALR para javaScript para el procesamiento y creación de gramaticas libres de contexto.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100 border-secondary bg-slate-800 text-white shadow-sm p-3" style="background-color: #1e293b;">
            <div class="card-body">
                <div class="feature-icon bg-warning bg-gradient text-dark rounded-3 mb-3 d-inline-flex align-items-center justify-content-center px-3 py-2">
                    <i class="bi bi-cloud-arrow-up-fill fs-3"></i>
                </div>
                <h3 class="fw-bold">Persistencia de datos</h3>
                <p class="text-secondary">Tus lenguajes se guardan automaticamente para que puedas acceder a ellos en cualquier momento.</p>
            </div>
        </div>
    </div>
</div>

<footer class="pt-5 my-5 text-secondary border-top border-secondary text-center">
    <div class="row">
        <div class="col-12 col-md">
            <small class="d-block mb-3">&copy; 2026 Wison Compiler - by Pablo-dev</small>
            <p style="font-size: 0.8rem;">
                Pagina web para aprender a crear gramaticas libres de contexto. <br>
                Hecho con <i class="bi bi-heart-fill text-danger"></i> y mucha cafeína.
            </p>
        </div>
    </div>
</footer>

<style>
    .card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #334155;
    }
    .card:hover {
        transform: translateY(-10px);
        border-color: #0dcaf0; 
        box-shadow: 0 0 20px rgba(13, 202, 240, 0.2) !important;
    }
    .text-slate-300 {
        color: #cbd5e1;
    }
</style>