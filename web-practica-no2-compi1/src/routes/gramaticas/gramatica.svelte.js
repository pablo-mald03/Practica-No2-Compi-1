//Clase que permite exportar la logica de las gramaticas
export function createGrammarState() {

    let requests = $state([
        { id: 1, nombre: "Calculadora_Base", fecha: "2026-04-03", lenguaje: "Expresiones" },
        { id: 2, nombre: "Analizador_JSON", fecha: "2026-04-02", lenguaje: "Estructuras" }
    ]);

    /*Atributos que permiten controlar las entradas y las evaluaciones de lo que ingresa el usuario*/
    let entradaUsuario = $state("");
    let gramaticaVisible = $state("// B -> N + id...");
    let requestSeleccionado = $state(null);
    let mostrarArbol = $state(false);

    /*Atributo que guarda el estado del cursor*/
    let cursor = $state({ fila: 1, columna: 1 });

    /*Atributos de validacion de errores*/
    let erroresValidacion = $state([]);
    let mostrarTablaErrores = $state(true);

    //Array de numeros basados en los saltos de linea
    let lineas = $derived(entradaUsuario.split("\n").length);

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
        }
    };

}