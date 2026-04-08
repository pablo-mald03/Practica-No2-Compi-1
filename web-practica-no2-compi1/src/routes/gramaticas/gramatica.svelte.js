
/*Imports de la clase*/
import { obtenerGramaticasAPI } from "$lib/services/GramaticaService";


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


    /*Apartado de atributos utilizados para poder interactuar con el canvas*/
    let panX = $state(0);
    let panY = $state(50);
    let zoom = $state(1);
    let isDragging = $state(false);
    let startPanX = 0;
    let startPanY = 0;

    /*ARBOL CODIGO QUEMADO. PENDIENTE DE INTEGRACION REAL*/
    const arbolDerivacionPrueba = {
        id: "root", label: "S",
        children: [
            {
                id: "n1", label: "S",
                children: [
                    { id: "n1_1", label: "S", children: [{ id: "h1", label: "'1'" }] },
                    { id: "n1_2", label: "'+'" },
                    { id: "n1_3", label: "S", children: [{ id: "h2", label: "'1'" }] }
                ]
            },
            { id: "n2", label: "'+'" },
            {
                id: "n3", label: "S",
                children: [{ id: "h3", label: "'1'" }]
            }
        ]
    };

    /*Atributos de los nodos del arbol de derivacion */
    let nodosArbol = $state([]);
    let linksArbol = $state([]);

    /*Funcion que permite calcular la distribucion del arbol de derivacion basandose en las hojas*/
    function calcularLayoutArbol(rootNode) {
        let nodes = [];
        let links = [];
        let leafIndex = 0;
        const H_SPACING = 60; 
        const V_SPACING = 80; 

        function traverse(node, depth) {
            let n = { id: node.id, label: node.label, x: 0, y: depth * V_SPACING };
            
            if (!node.children || node.children.length === 0) {
                n.x = leafIndex * H_SPACING;
                leafIndex++;
            } else {
                //Nodo padre
                let childrenX = [];
                for (let child of node.children) {
                    let childNode = traverse(child, depth + 1);
                    childrenX.push(childNode.x);
                    links.push({ source: n, target: childNode });
                }
                //Centrado del arbol en sus hijos
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

        cargarGramaticasPaginadas,

        /*Metodo que permite cargar la gramatica seleccionada mostrada dentro de la aplicacion */
        aplicarGramatica(request) {
            requestSeleccionado = request.id;
            
            gramaticaVisible = `Cargando detalles de la gramatica ${request.nombreGramatica}...`;
        },
        /*Metodo que permite descargar la gramatica seleciconada */
        descargarGramatica(request) {
            const idGramatica = request.id;
            
            //gramaticaVisible = `Cargando detalles de la gramatica ${request.nombreGramatica}...`;
        },
        /* Metodo para calcular fila y columna */
        actualizarPosicion(e) {
            const text = e.target.value;
            const pos = e.target.selectionStart;
            const lines = text.substr(0, pos).split("\n");
            cursor.fila = lines.length;
            cursor.columna = lines[lines.length - 1].length + 1;
        },


        /*METODO QUEMADO PARA PODER GENERAR LA GRAMATICA SIMULADA QUE SE BAJA DEL SERVIDOR*/
        aplicarGramatica(request) {
            requestSeleccionado = request.id;
            gramaticaVisible = `Gramatica: ${request.nombre};\n\nstart: expr EOF;\nexpr: term (('+'|'-') term)*; ...`;
        },

        /*Metodo que permite generar el arbol durante el analisis*/
        generarArbol() {
            if (entradaUsuario.trim() !== "") {
                mostrarArbol = true;
                // SIMULACION DE ERRORES QUEMADO DE MOMENTO
                erroresValidacion = [
                    { lexema: "(", Tipo: "sintactico", fila: 1, columna: 2, descripcion: "Token inesperado en la entrada" }
                ];
            }
        },

        /*Metodo para sincronizar el scroll de los numeros con el text area*/
        syncScroll(e) {
            const lineNumbers = document.getElementById('line-numbers-gutter');
            if (lineNumbers) {
                lineNumbers.scrollTop = e.target.scrollTop;
            }
        },
        /*Metodo que permite generar el arbol */
        generarArbol() {
            if (entradaUsuario.trim() !== "") {
                mostrarArbol = true;
                calcularLayoutArbol(arbolDerivacionPrueba);
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