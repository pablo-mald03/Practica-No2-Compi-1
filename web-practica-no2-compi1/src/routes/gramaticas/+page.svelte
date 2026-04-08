<script>
    import "./gramatica.css";
    import { onMount } from "svelte";
    import { createGrammarState } from "./gramatica.svelte.js";

    //Se inicializa el estado
    const g = createGrammarState();

    /*Metodo que se carga al momento de navegar al apartado*/
    onMount(() => {
        g.cargarGramaticasPaginadas();
    });
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
                            API conectada
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
                                        class="d-flex justify-content-between align-items-start mb-1"
                                    >
                                        <h6
                                            class="text-white mb-0 small text-truncate"
                                            style="max-width: 70%;"
                                            title={req.nombreGramatica}
                                        >
                                            {req.nombreGramatica}
                                        </h6>
                                        <span
                                            class="text-secondary x-small-text"
                                        >
                                            {req.fecha}
                                        </span>
                                    </div>

                                    <p class="mb-2 text-secondary x-small-text">
                                        <i class="bi bi-clock me-4"
                                        ></i>{req.hora}
                                    </p>

                                    <div class="d-flex gap-1">
                                        <button
                                            class="btn btn-sm {g.requestSeleccionado ===
                                            req.id
                                                ? 'btn-info'
                                                : 'btn-outline-info'} flex-grow-1 py-0 small-text"
                                            onclick={() =>
                                                g.aplicarGramatica(req)}
                                        >
                                            <i class="bi bi-play-fill"></i> Aplicar
                                        </button>

                                        <button
                                            class="btn btn-sm btn-outline-warning py-0 px-2"
                                            title="Descargar Gramatica"
                                            onclick={() =>
                                                g.descargarGramatica(req)}
                                        >
                                            <i class="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/each}

                        {#if g.hayMas}
                            <div class="text-center mt-3 mb-1">
                                <button
                                    class="btn btn-sm btn-outline-success w-100"
                                    onclick={() =>
                                        g.cargarGramaticasPaginadas()}
                                    disabled={g.cargando}
                                >
                                    {#if g.cargando}
                                        <span
                                            class="spinner-border spinner-border-sm me-1"
                                            aria-hidden="true"
                                        ></span>
                                        Cargando...
                                    {:else}
                                        <i class="bi bi-plus-circle me-1"></i> Cargar
                                        más
                                    {/if}
                                </button>
                            </div>
                        {:else if g.requests.length > 0}
                            <div
                                class="text-center mt-3 mb-1 text-secondary small"
                            >
                                <em>No hay mas gramaticas</em>
                            </div>
                        {:else if !g.cargando && g.requests.length === 0}
                            <div class="text-center mt-4 text-secondary small">
                                <em>No hay gramaticas guardadas aun.</em>
                            </div>
                        {/if}
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
                            aria-label="Limpiar entrada"
                        >
                            <i class="bi bi-eraser-fill"></i>
                        </button>
                    </div>

                    <div
                        class="card-body p-0 d-flex flex-column"
                        style="height: 350px;"
                    >
                        <div class="editor-wrapper flex-grow-1">
                            <div
                                id="line-numbers-gutter"
                                class="line-numbers overflow-hidden"
                            >
                                {#each Array(g.lineas) as _, i}
                                    <div
                                        class={g.cursor.fila === i + 1
                                            ? "line-number-active"
                                            : ""}
                                    >
                                        {i + 1}
                                    </div>
                                {/each}
                            </div>

                            <textarea
                                class="form-control border-0 text-success flex-grow-1 text-monospace bg-editor shadow-none h-100"
                                bind:value={g.entradaUsuario}
                                oninput={(e) => g.actualizarPosicion(e)}
                                onclick={(e) => g.actualizarPosicion(e)}
                                onkeyup={(e) => g.actualizarPosicion(e)}
                                onscroll={(e) => g.syncScroll(e)}
                                spellcheck="false"
                                placeholder="> Escribe tu código aquí..."
                            ></textarea>
                        </div>

                        <div
                            class="editor-status-bar d-flex justify-content-between px-3 py-1 border-top border-secondary text-secondary"
                        >
                            <div class="small-text text-monospace">
                                <span>{g.entradaUsuario.length} caracteres</span
                                >
                            </div>
                            <div class="small-text text-monospace fw-bold">
                                <span
                                    >Ln {g.cursor.fila}, Col {g.cursor
                                        .columna}</span
                                >
                            </div>
                        </div>

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
                        ></i>ERRORES DE ANALISIS</span
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
                        class="card-body p-0 overflow-auto border-top border-secondary"
                        style="max-height: 180px; background-color: #0a0f1a;"
                    >
                        <table
                            class="table table-dark table-hover mb-0 small text-monospace"
                            style="--bs-table-bg: transparent;"
                        >
                            <thead class="sticky-top bg-black">
                                <tr
                                    class="text-secondary border-secondary"
                                    style="font-size: 0.75rem; border-bottom: 2px solid #1e293b !important;"
                                >
                                    <th class="ps-3 border-0">Lexema</th>
                                    <th class="border-0">Tipo</th>
                                    <th class="text-center border-0">Fila</th>
                                    <th class="text-center border-0">Columna</th
                                    >
                                    <th class="ps-3 border-0">Descripcion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each g.erroresValidacion as error}
                                    <tr
                                        class="align-middle border-secondary shadow-sm"
                                    >
                                        <td class="ps-3 text-danger fw-bold">
                                            <code>{error.lexema || "EOF"}</code>
                                        </td>
                                        <td>
                                            <span
                                                class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"
                                                style="font-size: 0.65rem;"
                                            >
                                                {error.tipo || "Sintáctico"}
                                            </span>
                                        </td>
                                        <td class="text-center text-info"
                                            >{error.fila}</td
                                        >
                                        <td class="text-center text-info"
                                            >{error.columna}</td
                                        >
                                        <td class="ps-3 text-white italic-text">
                                            {error.mensaje}
                                        </td>
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
                    <span class="text-warning small fw-bold">
                        <i class="bi bi-diagram-3 me-2"></i>VISUALIZACION DEL
                        ARBOL DE DERIVACION
                    </span>
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Zoom in"
                            onclick={() => g.zoomIn()}
                            ><i class="bi bi-zoom-in"></i></button
                        >
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Zoom out"
                            onclick={() => g.zoomOut()}
                            ><i class="bi bi-zoom-out"></i></button
                        >
                        <button
                            class="btn btn-outline-secondary text-white-50"
                            aria-label="Zoom"
                            onclick={() => g.resetCanvas()}
                            ><i class="bi bi-arrows-fullscreen"></i></button
                        >
                    </div>
                </div>

                <div
                    class="card-body p-0 canvas-area position-relative outline-none"
                    style="background-color: #050a15; cursor: {g.isDragging
                        ? 'grabbing'
                        : 'grab'};"
                    role="application"
                    aria-label="Lienzo interactivo"
                    tabindex="0"
                    onmousedown={(e) => g.iniciarDrag(e)}
                    onmousemove={(e) => g.arrastrar(e)}
                    onmouseup={() => g.detenerDrag()}
                    onmouseleave={() => g.detenerDrag()}
                    onwheel={(e) => g.hacerZoom(e)}
                    onkeydown={(e) => {
                        if (e.key === "Escape") g.resetCanvas();
                    }}
                >
                    {#if g.mostrarArbol}
                        <svg class="w-100 h-100" style="pointer-events: none;">
                            <defs>
                                <filter
                                    id="shadow"
                                    x="-50%"
                                    y="-50%"
                                    width="200%"
                                    height="200%"
                                >
                                    <feDropShadow
                                        dx="0"
                                        dy="4"
                                        stdDeviation="4"
                                        flood-opacity="0.3"
                                        flood-color="#000"
                                    />
                                </filter>
                                <radialGradient id="nodeGradient">
                                    <stop offset="30%" stop-color="#1e293b" />
                                    <stop offset="100%" stop-color="#0f172a" />
                                </radialGradient>
                            </defs>

                            <g
                                transform="translate({g.panX +
                                    400}, {g.panY}) scale({g.zoom})"
                            >
                                {#each g.linksArbol as link (link.source.id + "-" + link.target.id)}
                                    <line
                                        x1={link.source.x}
                                        y1={link.source.y}
                                        x2={link.target.x}
                                        y2={link.target.y}
                                        stroke="#1e293b"
                                        stroke-width="2"
                                        stroke-dasharray={link.target.label ===
                                        "LAMBDA"
                                            ? "5"
                                            : "0"}
                                    />
                                {/each}

                                {#each g.nodosArbol as nodo (nodo.id)}
                                    <g
                                        transform="translate({nodo.x}, {nodo.y})"
                                    >
                                        <circle
                                            r={nodo.r}
                                            fill="url(#nodeGradient)"
                                            stroke={nodo.esTerminal
                                                ? "#10b981"
                                                : "#38bdf8"}
                                            stroke-width="2"
                                            filter="url(#shadow)"
                                        />
                                        <text
                                            text-anchor="middle"
                                            dominant-baseline="central"
                                            fill={nodo.esTerminal
                                                ? "#a7f3d0"
                                                : "#e0e7ff"}
                                            font-family="monospace"
                                            font-weight="bold"
                                            font-size={nodo.fSize}
                                        >
                                            {nodo.label}
                                        </text>
                                    </g>
                                {/each}
                            </g>
                        </svg>

                        <div
                            class="position-absolute bottom-0 start-0 p-2 text-secondary small-text text-monospace"
                            style="pointer-events: none;"
                        >
                            Zoom: {Math.round(g.zoom * 100)}% | X: {g.panX} Y: {g.panY}
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

                    <div
                        class="canvas-grid-overlay"
                        style="pointer-events: none;"
                    ></div>
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
