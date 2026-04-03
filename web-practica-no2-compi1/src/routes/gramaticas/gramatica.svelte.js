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

    /*Atributos de validacion de errores*/ 
    let erroresValidacion = $state([]); 
    let mostrarTablaErrores = $state(true);

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
        }
    };

}