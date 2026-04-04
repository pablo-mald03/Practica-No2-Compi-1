//Clase que permite exportar la logica de las gramaticas
export function createGrammarState() {

    /*CODIGO QUEMADO*/
    let requests = $state([
        { id: 1, nombre: "Calculadora_Base", fecha: "2026-04-03", lenguaje: "Expresiones" },
        { id: 2, nombre: "Analizador_JSON", fecha: "2026-04-02", lenguaje: "Estructuras" },
        { id: 3, nombre: "Analizador_JSON", fecha: "2026-04-02", lenguaje: "Estructuras" },
        { id: 4, nombre: "Analizador_JSON", fecha: "2026-04-02", lenguaje: "Estructuras" },
        { id: 5, nombre: "Analizador_JSON", fecha: "2026-04-02", lenguaje: "Estructuras" }

    ]);

    /*Atributos que permiten controlar las entradas y las evaluaciones de lo que ingresa el usuario*/
    let entradaUsuario = $state("");

    /*CODIGO QUEMADO DE MOMENTO*/
    let gramaticaVisible = $state("// B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n B -> N + id... \n C -> B + C \n K-> T +B \n");
    let requestSeleccionado = $state(null);
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



    return {
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