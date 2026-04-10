<script>
    import "./editor.css";
    import { createEditorState } from "./editor.svelte.js";
    import ModalGuardar from "./componentes/notificaciones/ModalGuardar.svelte";
    import ModalResultado from "./componentes/notificaciones/ModalResultado.svelte";

    //Se inicializa el estado
    const e = createEditorState();

    let elTextarea;
    let elGutter;
    let elFileInput;

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

<div
    class="container-fluid min-vh-100 d-flex flex-column text-white p-0"
    style="background-color: #0f172a;"
>
    <main class="flex-grow-1 p-4 d-flex flex-column">
        <div class="row g-4 flex-grow-1">
            {#if e.mostrarPresets}
                <div class="col-md-2 d-flex flex-column">
                    <div
                        class="card shadow-lg border-secondary bg-dark flex-grow-1"
                    >
                        <div
                            class="card-header border-secondary text-info small fw-bold"
                            style="background-color: #1e293b;"
                        >
                            <i class="bi bi-collection-fill me-2"></i>PRESETS
                        </div>
                        <div class="card-body p-2">
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("Cuerpo-Wison", elTextarea)}
                            >
                                <i class="bi bi-plus-circle me-2 text-info"
                                ></i>Estructura Wison
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("terminal", elTextarea)}
                            >
                                <i class="bi bi-regex me-2 text-info"
                                ></i>Terminal
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("no-terminal", elTextarea)}
                            >
                                <i class="bi bi-alt me-2 text-info"></i>No
                                Terminal
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("simbolo-init", elTextarea)}
                            >
                                <i class="bi bi-code me-2 text-info"></i>Simbolo
                                Inicial
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("produccion", elTextarea)}
                            >
                                <i class="bi bi-braces me-2 text-info"
                                ></i>Produccion
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("mayus-letras", elTextarea)}
                            >
                                <i
                                    class="bi bi-file-earmark-code-fill me-2 text-info"
                                ></i>ER Letras Mayusculas
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("min-letras", elTextarea)}
                            >
                                <i
                                    class="bi bi-file-earmark-code me-2 text-info"
                                ></i>ER Letras Minuscrulas
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("letras-total", elTextarea)}
                            >
                                <i
                                    class="bi bi-file-earmark-code-fill me-2 text-info"
                                ></i>ER Letras
                            </button>
                            <button
                                class="btn btn-outline-secondary text-white btn-sm w-100 mb-2 text-start border-0"
                                onclick={() =>
                                    e.cargarPreset("numeros", elTextarea)}
                            >
                                <i
                                    class="bi bi-file-earmark-code me-2 text-info"
                                ></i>ER Numeros
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <div
                class="{e.mostrarPresets
                    ? 'col-md-7'
                    : 'col-md-9'} d-flex flex-column"
            >
                <div
                    class="card shadow-lg border-secondary bg-dark d-flex flex-column flex-grow-1 mb-4"
                >
                    <div
                        class="card-header border-secondary d-flex justify-content-between align-items-center"
                        style="background-color: #1e293b;"
                    >
                        <div class="d-flex align-items-center">
                            <button
                                class="btn btn-sm btn-outline-info me-3 border-0"
                                onclick={() =>
                                    (e.mostrarPresets = !e.mostrarPresets)}
                                aria-label="Mostrar presets"
                            >
                                <i
                                    class="bi {e.mostrarPresets
                                        ? 'bi-layout-sidebar-inset'
                                        : 'bi-layout-sidebar'}"
                                ></i>
                            </button>
                            <h5 class="mb-0 text-info font-monospace">
                                Editor.wison
                            </h5>
                        </div>
                        <span class="badge bg-warning text-dark"
                            >Wison Engine</span
                        >
                    </div>

                    <div
                        class="card-body p-0 position-relative d-flex flex-grow-1"
                        style="background-color: #0f172a; overflow: hidden;"
                    >
                        <div class="gutter" bind:this={elGutter}>
                            {#each e.lineasArray as n}
                                <div
                                    class="gutter-num"
                                    class:text-info={n === e.fila}
                                >
                                    {n}
                                </div>
                            {/each}
                        </div>

                        <textarea
                            bind:this={elTextarea}
                            class="form-control border-0 text-white editor-textarea flex-grow-1"
                            bind:value={e.codigoGramatica}
                            onkeyup={handleCursor}
                            onclick={handleCursor}
                            onscroll={handleScroll}
                            spellcheck="false"
                            placeholder="/* Escribe tu gramatica aqui... */"
                        ></textarea>
                    </div>

                    <div
                        class="status-bar px-3 py-1 text-white border-top border-secondary d-flex justify-content-between"
                        style="background-color: #1e293b;"
                    >
                        <span class="small opacity-75"
                            >Wison Compiler | UTF-8</span
                        >
                        <span class="small font-monospace text-info"
                            >Ln {e.fila}, Col {e.columna}</span
                        >
                    </div>

                    <div
                        class="card-footer border-secondary d-flex justify-content-between align-items-center"
                        style="background-color: #1e293b;"
                    >
                        <button
                            class="btn btn-outline-primary fw-bold"
                            onclick={() => e.probarGramatica()}
                            aria-label="probar gramatica"
                        >
                            <i class="bi bi-terminal me-1"></i> PROBAR
                        </button>

                        <div class="d-flex align-items-center">
                            <input
                                type="file"
                                accept=".txt,.wison"
                                class="d-none"
                                bind:this={elFileInput}
                                onchange={(ev) => e.cargarDesdeArchivo(ev)}
                            />

                            <button
                                class="btn btn-outline-info me-2"
                                onclick={() => elFileInput.click()}
                                title="Cargar archivo"
                            >
                                <i class="bi bi-file-earmark-arrow-up"></i>
                            </button>

                            <button
                                class="btn btn-outline-warning me-2"
                                onclick={() => {
                                    e.codigoGramatica = "";
                                    e.errores = [];
                                    e.logConsola =
                                        "Wison Compiler v1.0.0\n\nEsperando entrada...";
                                }}
                                title="Limpiar"
                            >
                                <i class="bi bi-trash"></i>
                            </button>

                            <button
                                class="btn btn-success px-4 fw-bold shadow-sm"
                                onclick={() => e.compilar()}
                            >
                                <i class="bi bi-play-fill me-1"></i> GENERAR
                            </button>
                        </div>
                    </div>
                </div>

                {#if e.errores.length > 0}
                    <div class="card shadow-lg border-danger bg-dark">
                        <div
                            class="card-header bg-danger text-white d-flex justify-content-between align-items-center"
                        >
                            <span
                                ><i class="bi bi-bug-fill me-2"></i>Errores
                                Detectados ({e.errores.length})</span
                            >
                            <button
                                class="btn btn-sm btn-light py-0 px-2"
                                onclick={() =>
                                    (e.mostrarErrores = !e.mostrarErrores)}
                                aria-label="mostrar errores"
                            >
                                <i
                                    class="bi {e.mostrarErrores
                                        ? 'bi-chevron-up'
                                        : 'bi-chevron-down'} text-danger"
                                ></i>
                            </button>
                        </div>

                        {#if e.mostrarErrores}
                            <div
                                class="card-body p-0 overflow-auto"
                                style="max-height: 180px; border-top: 1px solid #dc3545;"
                            >
                                <table
                                    class="table table-dark table-hover table-bordered mb-0 small"
                                    style="border-color: #334155;"
                                >
                                    <thead
                                        class="sticky-top"
                                        style="z-index: 10;"
                                    >
                                        <tr class="table-active">
                                            <th
                                                class="py-1 px-3"
                                                style="width: 15%;">Lexema</th
                                            >
                                            <th
                                                class="py-1 px-3 text-info"
                                                style="width: 15%;">Tipo</th
                                            >
                                            <th
                                                class="py-1 px-2 text-center"
                                                style="width: 10%;">Fila</th
                                            >
                                            <th
                                                class="py-1 px-2 text-center"
                                                style="width: 10%;">Columna</th
                                            >
                                            <th class="py-1 px-3"
                                                >Descripción</th
                                            >
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each e.errores as err}
                                            <tr class="align-middle">
                                                <td class="py-1 px-3">
                                                    <code class="text-info"
                                                        >{err.lexema}</code
                                                    >
                                                </td>
                                                <td class="py-1 px-3">
                                                    <span
                                                        class="badge bg-danger-subtle text-danger border border-danger-subtle w-100"
                                                    >
                                                        {err.tipo}
                                                    </span>
                                                </td>
                                                <td
                                                    class="py-1 px-2 text-center font-monospace text-secondary"
                                                >
                                                    {err.fila}
                                                </td>
                                                <td
                                                    class="py-1 px-2 text-center font-monospace text-secondary"
                                                >
                                                    {err.columna}
                                                </td>
                                                <td
                                                    class="py-1 px-3 text-light-50"
                                                >
                                                    {err.descripcion}
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="col-md-3 d-flex flex-column">
                <div
                    class="card shadow-lg border-secondary flex-grow-1"
                    style="background-color: #0f172a;"
                >
                    <div
                        class="card-header border-secondary text-warning py-2"
                        style="background-color: #1e293b;"
                    >
                        <h6 class="mb-0 small fw-bold text-warning">
                            CONSOLA DE SALIDA
                        </h6>
                    </div>
                    <div
                        class="card-body p-3 overflow-auto flex-grow-1 bg-transparent"
                    >
                        <pre class="text-success small"><code
                                >{e.logConsola}</code
                            ></pre>
                    </div>

                    <button
                        class="btn btn-sm btn-outline-warning p-0 px-2 border-secondary"
                        style="position: absolute; bottom: 10px; right: 10px; opacity: 0.7; background-color: #1e293b;"
                        title="Limpiar consola"
                        onclick={() => e.limpiarConsola()}
                        aria-label="limpiar consola"
                    >
                        <i class="bi bi-brush-fill" style="font-size: 0.8rem;"
                        ></i>
                    </button>
                </div>
            </div>
        </div>
    </main>

    <footer
        class="py-2 px-4 border-top border-secondary text-center small text-white-50"
        style="background-color: #1e293b;"
    >
        <div class="d-flex justify-content-between align-items-center">
            <span>© 2026 Wison Compiler - Pablo-company</span>
            <div>
                <span class="me-3"><i class="bi bi-cpu me-1"></i> V 1.0.0</span>
                <span><i class="bi bi-github me-1"></i> pablo-dev</span>
            </div>
        </div>
    </footer>
</div>

{#if e.mostrarModalExito}
    <ModalGuardar
        titulo="Analisis Exitoso"
        mensaje="La gramatica se genero correctamente. ¿Deseas guardarla para poder usarla?"
        onCancelar={() => e.cerrarModal()}
        onGuardar={(nombre) => e.guardarGramatica(nombre)}
    />
{/if}

{#if e.mostrarModalResultado}
    <ModalResultado
        tipo={e.datosResultado.tipo}
        titulo={e.datosResultado.titulo}
        mensaje={e.datosResultado.mensaje}
        onAceptar={() => e.cerrarModalResultado()}
    />
{/if}
