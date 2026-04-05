//import del parser
import parser from "$lib/analizador/wison-parser.js";

import { tick } from "svelte";

//Funcion javaScript que permite crear la reactividad de la pagina web
export function createEditorState() {

    //Se definen las variables que se usaran para operar de forma reactiva
    let codigoGramatica = $state("");
    let logConsola = $state("Wison Compiler v1.0.0\n\nEsperando entrada...");
    let fila = $state(1);
    let columna = $state(1);
    let errores = $state([]);

    /*Variable que permite mostrar los presets*/
    let mostrarPresets = $state(true);

    /*Estado para minimizar y maximizar la tabla de errores*/
    let mostrarErrores = $state(true);

    //Registro de las lineas que tiene el editor de texto
    let lineasArray = $derived(codigoGramatica.split("\n").map((_, i) => i + 1));

    /*Variables para manejar el modal de notificaciones*/
    let mostrarModalExito = $state(false);
    let astGenerado = null;

    /*Variables del estado del modal de resultado */
    let mostrarModalResultado = $state(false);
    let datosResultado = $state({ tipo: "exito", titulo: "", mensaje: "" });

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

        get mostrarModalExito() { return mostrarModalExito; },
        set mostrarModalExito(valor) { mostrarModalExito = valor; },

        get mostrarModalResultado() { return mostrarModalResultado; },
        get datosResultado() { return datosResultado; },

        /*Metodo que permite cerrar el modal del resultado de guardado */

        cerrarModalResultado() {
            mostrarModalResultado = false;
        },

        // Metodo para cuando el usuario le da "Cancelar" en el modal
        cerrarModal() {
            mostrarModalExito = false;
            astGenerado = null;
            this.logConsola += `\n[INFO] Operacion de guardado cancelada.`;
        },

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

        // Metodo para cuando el usuario le da a guardar en el modal y se guarda la gramatica
        guardarGramatica(nombre) {

            this.mostrarModalExito = false; 
            this.logConsola += `\n\n[INFO] Guardando la gramatica '${nombre}' en la aplicacion...`;

            // TIMEOUT QUEMADO
            setTimeout(() => {
                
                /*constante QUEMADA DE MOMENTO */
                const backendRespondioBien = false; 

                if (backendRespondioBien) {
                    datosResultado = {
                        tipo: "exito",
                        titulo: "Guardado Exitoso",
                        mensaje: `La gramatica "${nombre}" se ha guardado correctamente en la aplicacion.`
                    };
                    this.logConsola += `\n\n[EXITOSO] Gramatica guardada en la aplicacion.`;
                } else {
                    datosResultado = {
                        tipo: "error",
                        titulo: "Error al Guardar",
                        mensaje: `No se pudo guardar la gramatica "${nombre}". Verifica tu conexion o intenta mas tarde.`
                    };
                    this.logConsola += `\n\n[ERROR] Fallo de conexion con la API.`;
                }

                mostrarModalResultado = true;
                
            }, 800);
        },

        /*Metodo que permite compilar QUEMADO DE MOMENTO*/
        async compilar() {

            this.logConsola = "Wison Compiler v1.0.0\n\n[INFO] Iniciando analisis...";
            this.errores = [];
            this.mostrarErrores = false;
            this.mostrarModalExito = false;

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
                    this.logConsola += `\n\n[ADVERTENCIA] Analisis finalizado con ${this.errores.length} errores.`;
                    this.mostrarErrores = true;
                    return null;
                }

                this.logConsola += "\n\n[EXITOSO] Analisis completado con exito.";

                //Guardado del arbol
                astGenerado = ast;
                this.mostrarModalExito = true;

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
            this.logConsola += `\n\n[ERROR] Analisis abortado por fallo critico.`;
        },


        /*Apartado de metodos que permiten generar las interaciciones con el modal de mensajes*/


    };
}