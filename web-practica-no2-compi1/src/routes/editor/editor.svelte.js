//Funcion javaScript que permite crear la reactividad de la pagina web
export function createEditorState() {
    //Se definen las variables que se usaran para operar de forma reactiva
    let codigoGramatica = $state("");
    let logConsola = $state("Wison Compiler v1.0.0\nEsperando entrada...");
    let fila = $state(1);
    let columna = $state(1);
    let errores = $state([]);

    /*Variable que permite mostrar los presets*/
    let mostrarPresets = $state(true);

    /*Estado para minimizar y maximizar la tabla de errores*/
    let mostrarErrores = $state(true);

    //Registro de las lineas que tiene el editor de texto
    let lineasArray = $derived(codigoGramatica.split("\n").map((_, i) => i + 1));

    //Se retorna el objeto para poderse usar en el HTML en el DOM
    return {
        // Getters y Setters para que la web pueda detectar los cambios
        get codigoGramatica() { return codigoGramatica; },
        set codigoGramatica(codigo) { codigoGramatica = codigo; },

        get logConsola() { return logConsola; },
        set logConsola(logSeleccionado) { logConsola = logSeleccionado; },

        get fila() { return fila; },
        set fila(valor) { fila = valor; },

        get columna() { return columna; },
        set columna(valor) { columna = valor; },

        get errores() { return errores; },
        set errores(valor) { errores = valor; },

        get mostrarPresets() { return mostrarPresets; },
        set mostrarPresets(presets) { mostrarPresets = presets; },

        get mostrarErrores() { return mostrarErrores; },
        set mostrarErrores(valor) { mostrarErrores = valor; },

        get lineasArray() { return lineasArray; },

        //Metodo que permite actualizar la posicion del caret
        actualizarPosicion(textArea) {
            const textoHastaCursor = textArea.value.substring(0, textArea.selectionStart);
            const lineas = textoHastaCursor.split("\n");
            fila = lineas.length;
            columna = lineas[lineas.length - 1].length + 1;
        },

        /*Metodo que permite cargar un preset para poder insertar codigo*/
        cargarPreset(tipo) {
            if (tipo === "calculadora") {
                codigoGramatica = `%lex\n%%\n"+" return '+';\n[0-9]+ return 'NUM';\n/lex\n%%\nexp: exp '+' NUM | NUM;`;
            }
            logConsola += `\n[INFO] Preset "${tipo}" cargado.`;
        },

        /*Metodo que permite compilar QUEMADO DE MOMENTO*/
        compilar() {
            logConsola += "\n[INFO] Iniciando analisis...";
            mostrarErrores = true;
            errores = [
                { lexema: "@", tipo: "Lexico", fila: 2, columna: 5, descripcion: "Error inesperado" },
                { lexema: "(", tipo: "Sintactico", fila: 2, columna: 5, descripcion: "Error inesperado" },
                { lexema: "}", tipo: "Sintactico", fila: 2, columna: 5, descripcion: "Error inesperado" },
                { lexema: "}", tipo: "Sintactico", fila: 2, columna: 5, descripcion: "Error inesperado" },
                { lexema: "a= 0", tipo: "Semantico", fila: 2, columna: 5, descripcion: "Variable no definida" },
                { lexema: "if", tipo: "Sintactico", fila: 2, columna: 5, descripcion: "token no registrado en la gramatica" }
            ];
        }
    };
}