<script>
    let codigoGramatica = $state(''); //Variable reactiva
    let logConsola = $state('Esperando compilación...');

    function compilar() {
        logConsola = "Enviando a Jison... \nGenerando código en caliente...";
        //pendiente conexion de jison
    }
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
        <a class="navbar-brand" href="/">Compiladores Pro</a>
        <div class="navbar-nav">
            <a class="nav-link" href="/">Inicio</a>
            <a class="nav-link" href="/editor">Editor</a>
        </div>
    </div>
</nav>

<div class="row">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Editor de Gramática (.jison)</h5>
            </div>
            <div class="card-body p-0">
                <textarea 
                    class="form-control border-0 family-monospace" 
                    style="height: 400px; font-family: 'Courier New', Courier, monospace;"
                    bind:value={codigoGramatica}
                    placeholder="Escribe tu gramatica aquí..."
                ></textarea>
            </div>
            <div class="card-footer text-end">
                <button class="btn btn-success" onclick={compilar}>
                    Compilar e Inyectar
                </button>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card shadow-sm">
            <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Consola de Salida</h5>
            </div>
            <div class="card-body bg-black text-success" style="height: 455px; overflow-y: auto;">
                <pre><code>{logConsola}</code></pre>
            </div>
        </div>
    </div>
</div>