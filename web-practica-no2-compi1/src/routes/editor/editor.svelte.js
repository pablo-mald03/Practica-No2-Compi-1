//import del parser
import parser from "$lib/analizador/wison-parser.js";

import { tick } from "svelte";

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
        async compilar() {

            this.logConsola = "Wison Compiler v1.0.0\n[INFO] Iniciando analisis...";
            this.errores = [];
            this.mostrarErrores = false;

            await tick();

            try {

                parser.yy = {
                    errores: []
                };

                parser.parseError = (str, hash) => {
                    const esperadosLimpios = this.traducirEsperados(hash.expected);

                    parser.yy.errores.push({
                        lexema: hash.text || hash.token || "Desconocido",
                        tipo: "Sintactico",
                        fila: hash.loc?.first_line || 1,
                        columna: (hash.loc?.first_column || 0) + 1,
                        descripcion: `Se esperaba: ${esperadosLimpios}`
                    });

                };

                /* AST retornado por el analizador sintactico LALR */
                const ast = parser.parse(this.codigoGramatica);

                this.errores = [...parser.yy.errores];

                if (this.errores.length > 0) {
                    this.logConsola += `\n[ADVERTENCIA] Analisis finalizado con ${this.errores.length} errores.`;
                    this.mostrarErrores = true;
                    return null;
                }

                this.logConsola += "\n[EXITOSO] Analisis completado con exito.";
                return ast;

            } catch (e) {
                this.procesarErrorFatal(e);
                return null;
            }
        },

        /* Metodo delegado auxiliar para procesar los errores */
        procesarErrorFatal(e) {
            let errorFatal;
            if (e.hash) {
                const h = e.hash;
                const esperadosLimpios = this.traducirEsperados(h.expected);

                errorFatal = {
                    lexema: h.text || h.token || "EOF",
                    tipo: "Sintactico",
                    fila: h.loc?.first_line || "Desconocida",
                    columna: (h.loc?.first_column || 0) + 1,
                    descripcion: `Error critico. Se esperaba: ${esperadosLimpios}`
                };
            } else {
                errorFatal = {
                    lexema: "N/A",
                    tipo: "Sistema",
                    fila: "N/A",
                    columna: "N/A",
                    descripcion: e.message
                };
            }

            this.errores = [...this.errores, errorFatal];
            this.mostrarErrores = true;
            this.logConsola += `\n[ERROR] Analisis abortado por fallo critico.`;
        },

    };
}