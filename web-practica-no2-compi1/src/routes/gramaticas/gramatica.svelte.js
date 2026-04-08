
/*Imports de la clase*/
import { obtenerGramaticasAPI, obtenerAnalizadorAPI, descargarParserAPI } from "$lib/services/GramaticaService";


//Clase que permite exportar la logica de las gramaticas
export function createGrammarState() {

    /*Listado de las gramaticas almacenadas en la Web*/
    let requests = $state([]);

    // Variables para la paginación
    let limite = 10;
    let offset = 0;
    let hayMas = $state(true);
    let cargando = $state(false);

    /*Atributos que permiten controlar las entradas y las evaluaciones de lo que ingresa el usuario*/
    let entradaUsuario = $state("");

    /*Atributos que representan a las gramaticas que se cargan para poderlas utilizar*/
    let requestSeleccionado = $state(null);
    let gramaticaVisible = $state("");

    let mostrarArbol = $state(false);

    /*Atributo que guarda el estado del cursor*/
    let cursor = $state({ fila: 1, columna: 1 });

    /*Atributos de validacion de errores*/
    let erroresValidacion = $state([]);
    let mostrarTablaErrores = $state(true);

    //Array de numeros basados en los saltos de linea
    let lineas = $derived(entradaUsuario.split("\n").length);

    /*Variables de codigo inyectado en caliente */
    let analizadorInyectado = $state(null);
    let procesandoInyeccion = $state(false);


    /*Apartado de atributos utilizados para poder interactuar con el canvas*/
    let panX = $state(0);
    let panY = $state(50);
    let zoom = $state(1);
    let isDragging = $state(false);
    let startPanX = 0;
    let startPanY = 0;

    /*Atributos de los nodos del arbol de derivacion */
    let nodosArbol = $state([]);
    let linksArbol = $state([]);

    /*Funcion que permite calcular la distribucion del arbol de derivacion basandose en las hojas*/
    function calcularLayoutArbol(rootNode) {
        let nodes = [];
        let links = [];
        let leafIndex = 0;

        const RADIO_NODO = 50;       
        const H_SPACING = 170;       
        const V_SPACING = 180;       
        const MAX_FONT_SIZE = 16;    

        function traverse(node, depth) {
            let labelLength = node.label.length;
            
           
            let fontSize = MAX_FONT_SIZE;
            if (labelLength > 7) {
                fontSize = Math.max(8, 14 - (labelLength - 7));
            }

            let esTerminal = !node.children || node.children.length === 0;

            let n = {
                id: node.id,
                label: node.label,
                x: 0,
                y: depth * V_SPACING,
                r: RADIO_NODO,      
                fSize: fontSize,
                esTerminal: esTerminal
            };

            if (esTerminal) {
                n.x = leafIndex * H_SPACING;
                leafIndex++;
            } else {
                let childrenX = [];
                for (let child of node.children) {
                    let childNode = traverse(child, depth + 1);
                    childrenX.push(childNode.x);
                    links.push({ source: n, target: childNode });
                }
                n.x = childrenX.reduce((a, b) => a + b, 0) / childrenX.length;
            }
            nodes.push(n);
            return n;
        }

        if (rootNode) {
            let rootCalculated = traverse(rootNode, 0);
            let rootX = rootCalculated.x;
            nodes.forEach(n => n.x -= rootX);
        }

        nodosArbol = nodes;
        linksArbol = links;
    }

    /*Metodo que permite conectarse con la API para poder cargar las gramaticas almacenadas en la aplicacion*/
    async function cargarGramaticasPaginadas() {
        if (cargando || !hayMas) return;

        cargando = true;
        try {
            const nuevasGramaticas = await obtenerGramaticasAPI(limite, offset);

            if (nuevasGramaticas.length < limite) {
                hayMas = false;
            }

            requests = [...requests, ...nuevasGramaticas];

            offset += limite;

        } catch (error) {
            console.error("[ERROR] No se pudieron cargar las gramáticas:", error.message);
        } finally {
            cargando = false;
        }
    }

    /* ====================================================================
       METODO DE INYECCION DE CODIGO EN CALIENTE
       ==================================================================== */
    async function inyectarGramaticaEnCaliente(id) {
        if (procesandoInyeccion) return;

        procesandoInyeccion = true;
        gramaticaVisible = "Armando gramatica...\n\n";

        try {
            const parserData = await obtenerAnalizadorAPI(id);

            gramaticaVisible = `Compilando y montando ${parserData.nombreArchivo} en memoria...`;

            /*Creacion de los archivos*/
            const lexerBlob = new Blob([parserData.lexer], { type: 'application/javascript' });
            const parserBlob = new Blob([parserData.parser], { type: 'application/javascript' });

            const lexerUrl = URL.createObjectURL(lexerBlob);
            const parserUrl = URL.createObjectURL(parserBlob);

            //Inyección de modulos
            const importLexer = await import(/* @vite-ignore */ lexerUrl);
            const importParser = await import(/* @vite-ignore */ parserUrl);

            analizadorInyectado = {
                nombre: parserData.nombreArchivo,
                lexer: importLexer.default || importLexer,
                parser: importParser.default || importParser
            };

            //Se liberan las URL temporales
            URL.revokeObjectURL(lexerUrl);
            URL.revokeObjectURL(parserUrl);

            gramaticaVisible = `Gramatica [ ${parserData.nombreArchivo} ] cargada correctamente.\n\n`;

            const ClaseInyectada = analizadorInyectado.parser;
            const parserTemporal = new ClaseInyectada();

            gramaticaVisible += parserTemporal.estructuraGramatica;
            
            requestSeleccionado = id;

        } catch (error) {
            console.error("[ERROR INYECCIÓN]:", error);
            gramaticaVisible = `Error critico al inyectar: ${error.message}`;
            analizadorInyectado = null;
        } finally {
            procesandoInyeccion = false;
        }
    }

    return {

        /*Variables reactivas*/
        get requests() { return requests; },
        get hayMas() { return hayMas; },
        get cargando() { return cargando; },
        get requestSeleccionado() { return requestSeleccionado; },


        get requests() { return requests; },
        get entradaUsuario() { return entradaUsuario; },

        /*Metodo que permite verificar las entradas del usuario*/
        set entradaUsuario(entrada) { entradaUsuario = entrada; },
        get gramaticaVisible() { return gramaticaVisible; },

        /*Metodos que permiten mostrar los requests QUEMADOS DE MOMENTO*/
        get requestSeleccionado() { return requestSeleccionado; },
        get mostrarArbol() { return mostrarArbol; },

        /*Metodos que permiten validar los errores*/
        get erroresValidacion() { return erroresValidacion; },
        get mostrarTablaErrores() { return mostrarTablaErrores; },
        set mostrarTablaErrores(valor) { mostrarTablaErrores = valor; },

        // Getters para el cursor
        get cursor() { return cursor; },

        /*Getter que de la linea en la qu esta el editor*/
        get lineas() { return lineas; },

        get analizadorInyectado() { return analizadorInyectado; },

        cargarGramaticasPaginadas,
        async aplicarGramatica(request) {
            requestSeleccionado = request.id;

            await inyectarGramaticaEnCaliente(request.id);
        },

        /*Metodo que permite descargar la gramatica seleciconada */
        async descargarGramatica(request) {
            const idGramatica = request.id;

            try {
                const { blob, filename } = await descargarParserAPI(idGramatica);

                const downloadUrl = window.URL.createObjectURL(blob);

                const anchorElement = document.createElement('a');
                anchorElement.style.display = 'none';
                anchorElement.href = downloadUrl;
                anchorElement.download = filename;

                document.body.appendChild(anchorElement);
                anchorElement.click();

                document.body.removeChild(anchorElement);
                window.URL.revokeObjectURL(downloadUrl);

                console.log("¡Descarga completada con éxito!");

            } catch (error) {
                console.error("Error en la vista al descargar:", error.message);
                alert(`No se pudo descargar el archivo: ${error.message}`);
            }
        },
        /* Metodo para calcular fila y columna */
        actualizarPosicion(e) {
            const text = e.target.value;
            const pos = e.target.selectionStart;
            const lines = text.substr(0, pos).split("\n");
            cursor.fila = lines.length;
            cursor.columna = lines[lines.length - 1].length + 1;
        },

        /*Metodo que permite generar el arbol durante el analisis*/
        generarArbol() {
            if (!entradaUsuario.trim()) {
                return;
            }

            if (!analizadorInyectado) {
                alert("Primero debes seleccionar y cargar una gramatica.");
                return;
            }

            mostrarArbol = true;
            erroresValidacion = [];

            try {
                //FASE LEXICA: Obtener tokens usando el Lexer de Jison inyectado
                const tokens = analizadorInyectado.lexer.parse(entradaUsuario);

                // FASE SINTÁCTICA: Usar el Parser LL(1) inyectado
                const ClaseParser = analizadorInyectado.parser;
                const instanciaParser = new ClaseParser();

                const resultado = instanciaParser.parse(tokens);

                erroresValidacion = resultado.errores;

                if (resultado.arbol) {
                    calcularLayoutArbol(resultado.arbol);
                }

            } catch (error) {
                console.error("[ERROR CRITICO EN ANALISIS]:", error);
                erroresValidacion = [{
                    lexema: "N/A",
                    tipo: "Critico",
                    fila: 0,
                    columna: 0,
                    mensaje: "Error en la ejecución del analizador: " + error.message
                }];
            }

        },

        /*Metodo para sincronizar el scroll de los numeros con el text area*/
        syncScroll(e) {
            const lineNumbers = document.getElementById('line-numbers-gutter');
            if (lineNumbers) {
                lineNumbers.scrollTop = e.target.scrollTop;
            }
        },
        //Exportacion del estado del canvas
        get panX() { return panX; },
        get panY() { return panY; },
        get zoom() { return zoom; },
        get nodosArbol() { return nodosArbol; },
        get linksArbol() { return linksArbol; },

        //Metodo qu epermite arrastrar el canvas
        iniciarDrag(e) {
            isDragging = true;
            startPanX = e.clientX - panX;
            startPanY = e.clientY - panY;
        },
        /*Metodo que permite arrastrar el scroll*/
        arrastrar(e) {
            if (isDragging) {
                panX = e.clientX - startPanX;
                panY = e.clientY - startPanY;
            }
        },
        /*Metodo que permite detener el drag dentro del canvas */
        detenerDrag() {
            isDragging = false;
        },
        /*Metodo que permite hacer zoom en el canvas */
        hacerZoom(e) {
            e.preventDefault();
            const zoomAmount = e.deltaY * -0.001;
            zoom = Math.min(Math.max(0.2, zoom + zoomAmount), 3);
        },
        /*Metodos de zoom */
        zoomIn() { zoom = Math.min(zoom + 0.2, 3); },
        zoomOut() { zoom = Math.max(zoom - 0.2, 0.2); },
        resetCanvas() { panX = 0; panY = 50; zoom = 1; }
    };

}