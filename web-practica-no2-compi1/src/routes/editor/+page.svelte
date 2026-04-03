<script>
    import './editor.css';
    import { createEditorState } from './editor.svelte.js';

    //Se inicializa el estado
    const e = createEditorState();

    let elTextarea; 
    let elGutter;

    /*Metodo que permite verificar el estado del scroll*/
    function handleScroll() {
        if (elTextarea && elGutter) elGutter.scrollTop = elTextarea.scrollTop;
    }

    /*Metodo que permite obtener el scroll*/
    function handleCursor(event) {
        handleScroll();
        e.actualizarPosicion(event.target);
    }

</script>

<div class="row g-4">
    {#if e.mostrarPresets}
        <div class="col-md-2">
            <div class="card shadow-lg border-secondary bg-dark h-100">
                <div class="card-header border-secondary text-info small fw-bold">
                    <i class="bi bi-collection-fill me-2"></i>PRESETS
                </div>
                <div class="card-body p-2">
                    <button
                        class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start"
                        onclick={() => e.cargarPreset("calculadora")}
                    >
                        <i class="bi bi-plus-circle me-2"></i>Calculadora
                    </button>
                    <button
                        class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start"
                        onclick={() => e.cargarPreset("if-else")}
                    >
                        <i class="bi bi-alt me-2"></i>Condicionales
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <div class={e.mostrarPresets ? "col-md-7" : "col-md-9"}>
        <div class="card shadow-lg border-secondary bg-dark mb-4">
            <div class="card-header border-secondary d-flex justify-content-between align-items-center" style="background-color: #1e293b;">
                <div class="d-flex align-items-center">
                    <button
                        class="btn btn-sm btn-outline-info me-3"
                        onclick={() => (e.mostrarPresets = !e.mostrarPresets)}
                        aria-label="Insertar preset"
                    >
                        <i class="bi {e.mostrarPresets ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}"></i>
                    </button>
                    <h5 class="mb-0 text-info font-monospace">Editor.wison</h5>
                </div>
                <span class="badge bg-warning text-dark">Wison Engine</span>
            </div>

            <div class="card-body p-0 position-relative d-flex" style="background-color: #0f172a;">
                <div class="gutter select-none" bind:this={elGutter}>
                    {#each e.lineasArray as n}
                        <div class="gutter-num" class:text-info={n === e.fila}>
                            {n}
                        </div>
                    {/each}
                </div>

                <textarea
                    bind:this={elTextarea}
                    class="form-control border-0 text-white editor-textarea"
                    bind:value={e.codigoGramatica}
                    onkeyup={handleCursor}
                    onclick={handleCursor}
                    onscroll={handleScroll}
                    spellcheck="false"
                    placeholder="/* Escribe tu gramatica aqui... */"
                ></textarea>
            </div>

            <div class="status-bar px-3 py-1 bg-dark text-white border-top border-secondary d-flex justify-content-between">
                <span class="small">Wison Compiler | UTF-8</span>
                <span class="small font-monospace">Ln {e.fila}, Col {e.columna}</span>
            </div>

            <div class="card-footer border-secondary text-end" style="background-color: #1e293b;">
                <button
                    class="btn btn-outline-warning me-2"
                    onclick={() => { e.codigoGramatica = ""; e.errores = []; }}
                    aria-label="Limpiar editor"
                >
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-success px-4 fw-bold shadow-sm" onclick={() => e.compilar()}>
                    <i class="bi bi-play-fill me-1"></i> GENERAR
                </button>
            </div>
        </div>

        {#if e.errores.length > 0}
            <div class="card shadow-lg border-danger bg-dark">
                <div class="card-header bg-danger text-white d-flex justify-content-between">
                    <span><i class="bi bi-bug-fill me-2"></i>Errores Detectados</span>
                    <button
                        class="btn-close btn-close-white"
                        onclick={() => (e.errores = [])}
                        aria-label="Cerrar reporte de errores"
                    ></button>
                </div>
                <div class="card-body p-0">
                    <table class="table table-dark table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Lexema</th>
                                <th>Tipo</th>
                                <th>Fila</th>
                                <th>Col</th>
                                <th>Descripcion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each e.errores as err}
                                <tr>
                                    <td class="text-danger">{err.tipo}</td>
                                    <td><code>{err.lexema}</code></td>
                                    <td>{err.fila}</td>
                                    <td>{err.columna}</td>
                                    <td>{err.descripcion}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </div>

    <div class="col-md-3">
        <div class="card shadow-lg border-warning h-100" style="background-color: #0f172a;">
            <div class="card-header border-warning text-white py-2" style="background-color: #1e293b;">
                <h6 class="mb-0 small fw-bold">CONSOLA DE SALIDA</h6>
            </div>
            <div class="card-body p-3 overflow-auto">
                <pre class="text-success small"><code>{e.logConsola}</code></pre>
            </div>
        </div>
    </div>
</div>
