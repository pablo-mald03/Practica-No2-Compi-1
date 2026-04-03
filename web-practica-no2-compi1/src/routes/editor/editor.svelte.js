// editor.svelte.js
export function createEditorState() {
    // 1. Definimos las variables internas (usando los nombres largos para evitar líos)
    let codigoGramatica = $state("");
    let logConsola = $state("Wison Compiler v1.0.0\nEsperando entrada...");
    let fila = $state(1);
    let columna = $state(1);
    let errores = $state([]);
    let mostrarPresets = $state(true);

    // 2. Definimos la lógica derivada
    let lineasArray = $derived(codigoGramatica.split("\n").map((_, i) => i + 1));

    // 3. Retornamos el objeto que el HTML va a usar
    return {
        // Getters y Setters para que Svelte 5 detecte los cambios
        get codigoGramatica() { return codigoGramatica; },
        set codigoGramatica(v) { codigoGramatica = v; },

        get logConsola() { return logConsola; },
        set logConsola(v) { logConsola = v; },

        get fila() { return fila; },
        set fila(v) { fila = v; },

        get columna() { return columna; },
        set columna(v) { columna = v; },

        get errores() { return errores; },
        set errores(v) { errores = v; },

        get mostrarPresets() { return mostrarPresets; },
        set mostrarPresets(v) { mostrarPresets = v; },

        get lineasArray() { return lineasArray; },

        // Métodos de acción
        actualizarPosicion(textarea) {
            const textoHastaCursor = textarea.value.substring(0, textarea.selectionStart);
            const lineas = textoHastaCursor.split("\n");
            fila = lineas.length; // Actualizamos la variable interna
            columna = lineas[lineas.length - 1].length + 1;
        },

        cargarPreset(tipo) {
            if (tipo === "calculadora") {
                codigoGramatica = `%lex\n%%\n"+" return '+';\n[0-9]+ return 'NUM';\n/lex\n%%\nexp: exp '+' NUM | NUM;`;
            }
            logConsola += `\n[INFO] Preset "${tipo}" cargado.`;
        },

        compilar() {
            logConsola += "\n[INFO] Iniciando análisis...";
            errores = [
                { tipo: "Sintactico", lexema: "}", fila: 2, columna: 5, descripcion: "Error inesperado" }
            ];
        }
    };
}