<script>
    let { titulo, mensaje, onCancelar, onGuardar } = $props();
    
    // Estado interno del modal para el input
    let nombreInput = $state("");

</script>

<div class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
     style="background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 1050;">
    
    <div class="card shadow-lg border-secondary bg-dark text-white" style="width: 400px; animation: fadeIn 0.2s ease-out;">
        
        <div class="card-header border-secondary d-flex align-items-center" style="background-color: #1e293b;">
            <i class="bi bi-check-circle-fill text-success me-2 fs-5"></i>
            <h5 class="mb-0 fw-bold">{titulo}</h5>
        </div>
        
        <div class="card-body" style="background-color: #0f172a;">
            <p class="text-light-50 mb-4">{mensaje}</p>
            
            <div class="mb-3">
                <label for="nombreGramatica" class="form-label small text-info font-monospace">Nombre de la gramática</label>
                <input 
                    type="text" 
                    id="nombreGramatica"
                    class="form-control bg-dark text-white border-secondary" 
                    placeholder="ej. mi_gramatica_v1"
                    bind:value={nombreInput}
                    autocomplete="off"
                >
            </div>
        </div>
        
        <div class="card-footer border-secondary d-flex justify-content-end gap-2" style="background-color: #1e293b;">
            <button class="btn btn-outline-secondary px-4" onclick={onCancelar}>
                Cancelar
            </button>
            <button 
                class="btn btn-success px-4" 
                onclick={() => onGuardar(nombreInput)}
                disabled={nombreInput.trim() === ""}
            >
                <i class="bi bi-cloud-arrow-up-fill me-1"></i> Guardar
            </button>
        </div>
    </div>
</div>

<style>
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .form-control:focus {
        border-color: #0dcaf0;
        box-shadow: 0 0 0 0.25rem rgba(13, 202, 240, 0.25);
    }
</style>