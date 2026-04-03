<script>
    import "./gramatica.css";

    import { createGrammarState } from "./gramatica.svelte.js";

    //Se inicializa el estado
    const g = createGrammarState();
</script>

<div
    class="container-fluid min-vh-100 d-flex flex-column p-0 bg-main text-white"
>
    <main class="flex-grow-1 p-3 d-flex flex-column gap-3">
        <div class="row g-3 flex-grow-0">
            <div class="col-md-3">
                <div class="card h-100 card-custom bg-dark shadow">
                    <div
                        class="card-header card-custom bg-panel text-info small fw-bold d-flex justify-content-between align-items-center"
                        style="height: 45px;"
                    >
                        <span class="d-flex align-items-center">
                            <i class="bi bi-cloud-arrow-down me-2 fs-5"></i>
                            GRAMATICAS GENERADAS
                        </span>
                        <span
                            class="badge bg-success-subtle text-success border border-success-subtle"
                        >
                            API lista
                        </span>
                    </div>
                    <div
                        class="card-body p-2 overflow-auto"
                        style="max-height: 350px;"
                    >
                        {#each g.requests as req}
                            <div
                                class="card mb-2 card-custom bg-transparent {g.requestSeleccionado ===
                                req.id
                                    ? 'border-info'
                                    : ''}"
                            >
                                <div class="card-body p-2">
                                    <div
                                        class="d-flex justify-content-between align-items-start"
                                    >
                                        <h6 class="text-white mb-1 small">
                                            {req.nombre}
                                        </h6>
                                        <span class="text-secondary small-text"
                                            >{req.fecha}</span
                                        >
                                    </div>
                                    <p class="mb-2 text-secondary small-text">
                                        Type: {req.lenguaje}
                                    </p>
                                    <button
                                        class="btn btn-sm {g.requestSeleccionado ===
                                        req.id
                                            ? 'btn-info'
                                            : 'btn-outline-info'} w-100 py-0"
                                        onclick={() => g.aplicarGramatica(req)}
                                        >Aplicar</button
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="col-md-5">
                <div class="card h-100 card-custom bg-dark shadow">
                    <div
                        class="card-header card-custom bg-panel text-warning small fw-bold d-flex justify-content-between align-items-center"
                    >
                        <span
                            ><i class="bi bi-terminal me-2"></i>ANALIZAR
                            ENTRADAS</span
                        >
                        <button
                            class="btn btn-sm btn-outline-warning border-0 py-0"
                            onclick={() => (g.entradaUsuario = "")}
                            aria-label="Limpiar entrada de texto"
                        >
                            <i class="bi bi-eraser-fill"></i>
                        </button>
                    </div>

                    <div
                        class="card-body p-0 d-flex flex-column"
                        style="height: 350px;"
                    >
                        <textarea
                            class="form-control border-0 text-success flex-grow-1 text-monospace p-3 bg-editor"
                            bind:value={g.entradaUsuario}
                            placeholder="> Escribe la entrada para probar la gramatica..."
                        ></textarea>
                        <div
                            class="card-footer card-custom bg-transparent text-end py-2"
                        >
                            <button
                                class="btn btn-sm btn-success px-4 fw-bold"
                                onclick={() => g.generarArbol()}
                            >
                                <i class="bi bi-diagram-3-fill me-2"></i>PROBAR
                                ENTRADA
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div
                    class="card h-100 card-custom bg-dark shadow text-monospace"
                >
                    <div
                        class="card-header card-custom bg-panel text-white small fw-bold"
                    >
                        <i class="bi bi-code-slash me-2"></i>GRAMATICA ACTIVA
                    </div>
                    <div
                        class="card-body p-0 overflow-auto bg-main"
                        style="height: 350px;"
                    >
                        <pre class="p-3 text-info mb-0 small"><code
                                >{g.gramaticaVisible}</code
                            ></pre>
                    </div>
                </div>
            </div>
        </div>

        {#if g.erroresValidacion.length > 0}
            <div class="card card-custom border-danger bg-dark shadow-sm">
                <div
                    class="card-header bg-danger text-white py-1 d-flex justify-content-between align-items-center"
                >
                    <span class="small fw-bold"
                        ><i class="bi bi-exclamation-triangle-fill me-2"
                        ></i>ERRORES DE VALIDACION</span
                    >
                    <button
                        class="btn btn-sm text-white p-0"
                        onclick={() =>
                            (g.mostrarTablaErrores = !g.mostrarTablaErrores)}
                        aria-label="{g.mostrarTablaErrores
                            ? 'Ocultar'
                            : 'Mostrar'} lista de errores"
                    >
                        <i
                            class="bi {g.mostrarTablaErrores
                                ? 'bi-chevron-up'
                                : 'bi-chevron-down'}"
                        ></i>
                    </button>
                </div>
                {#if g.mostrarTablaErrores}
                    <div
                        class="card-body p-0 overflow-auto"
                        style="max-height: 150px;"
                    >
                        <table
                            class="table table-dark table-hover mb-0 small text-monospace"
                        >
                            <tbody>
                                {#each g.erroresValidacion as error}
                                    <tr class="border-secondary">
                                        <td
                                            class="text-danger ps-3"
                                            style="width: 100px;">[ERROR]</td
                                        >
                                        <td
                                            class="text-secondary"
                                            style="width: 120px;"
                                            >Línea: {error.fila}</td
                                        >
                                        <td>{error.mensaje}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}

        <div class="flex-grow-1">
            <div class="card h-100 card-custom bg-dark shadow overflow-hidden">
                <div
                    class="card-header card-custom bg-panel d-flex justify-content-between align-items-center"
                >
                    <span class="text-warning small fw-bold"
                        ><i class="bi bi-diagram-3 me-2"></i>VISUALIZACION DEL
                        ARBOL DE DERIVACION</span
                    >
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Aumentar zoom"
                        >
                            <i class="bi bi-zoom-in"></i>
                        </button>
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Disminuir zoom"
                        >
                            <i class="bi bi-zoom-out"></i>
                        </button>
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Ver en pantalla completa"
                        >
                            <i class="bi bi-arrows-fullscreen"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body p-0 canvas-area">
                    {#if g.mostrarArbol}
                        <div
                            class="w-100 h-100 d-flex align-items-center justify-content-center"
                        >
                            <div class="text-center opacity-25">
                                <i
                                    class="bi bi-diagram-3"
                                    style="font-size: 5rem;"
                                ></i>
                                <p>Renderizando Árbol de Derivación...</p>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="d-flex h-100 align-items-center justify-content-center text-secondary opacity-50"
                        >
                            <p>
                                <i class="bi bi-info-circle me-2"></i>Introduce
                                una entrada valida para generar el arbol
                            </p>
                        </div>
                    {/if}
                    <div class="canvas-grid-overlay"></div>
                </div>
            </div>
        </div>
    </main>
</div>
