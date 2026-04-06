//import del parser
import parser from "$lib/analizador/wison-parser.js";
import GestorCompilador from "$lib/backend/GestorCompilador";
import { tick } from "svelte";
/*Created by Pablo */
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
    let mostrarErrores = $state(true);0

    //Registro de las lineas que tiene el editor de texto
    let lineasArray = $derived(codigoGramatica.split("\n").map((_, i) => i + 1));

    /*Variables para manejar el modal de notificaciones*/
    let mostrarModalExito = $state(false);
    let astGenerado = null;

    /*Variables del estado del modal de resultado */
    let mostrarModalResultado = $state(false);
    let datosResultado = $state({ tipo: "exito", titulo: "", mensaje: "" });


    /*Variable que permite manejar al controlador del analizador sintactico LL1 */
    let gestorCompilacion = new GestorCompilador();

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

        get gestorCompilacion() { return gestorCompilacion; },

        /*Metodo que permite cargar un archivo de entrada*/
        cargarDesdeArchivo(event) {
            const archivo = event.target.files[0];
            if (!archivo) return;

            const reader = new FileReader();

            reader.onload = (e) => {
                const contenido = e.target.result;

                const separador = this.codigoGramatica.trim() === "" ? "" : "\n\n";
                this.codigoGramatica += separador + contenido;

                this.logConsola += `\n\n[EXITOSO] Se ha importado: "${archivo.name}" (${archivo.size} bytes).`;

                event.target.value = "";
            };

            reader.onerror = () => {
                this.logConsola += `\n[ERROR] No se pudo leer el archivo "${archivo.name}".`;
            };

            reader.readAsText(archivo);
        },


        /*Metodo que permite cerrar el modal del resultado de guardado */

        cerrarModalResultado() {
            mostrarModalResultado = false;
        },

        // Metodo para cuando el usuario le da "Cancelar" en el modal
        cerrarModal() {
            mostrarModalExito = false;
            this.astGenerado = null;
            this.logConsola += `\n\n[INFO] Operacion de guardado cancelada.`;
        },

        //Metodo que permite actualizar la posicion del caret
        actualizarPosicion(textArea) {
            const textoHastaCursor = textArea.value.substring(0, textArea.selectionStart);
            const lineas = textoHastaCursor.split("\n");
            fila = lineas.length;
            columna = lineas[lineas.length - 1].length + 1;
        },

        /*Metodo que permite cargar un preset para poder insertar codigo*/
        async cargarPreset(tipo, textArea) {
            let snippet = "";

            if (tipo === "Cuerpo-Wison") {
                snippet = `Wison ¿\n\n/**-----Cuerpo del Lexer-----*/\n\nLex {:\n\n\n\n:}\n\n/**-----Cuerpo del Parser-----*/\n\nSyntax {{:\n\n\n\n:}}\n\n? Wison`;
            } else if (tipo === "terminal") {
                snippet = `Terminal $_Opcion_A    <- 'a';    #Nombre 'Opcion_A' modificable`;
            } else if (tipo === "no-terminal") {
                snippet = `No_Terminal %_Prod_A;    #Nombre 'Prod_A' modificable`;
            } else if (tipo === "simbolo-init") {
                snippet = `Initial_Sim %_Simbolo;    #Nombre 'Simbolo' modificable`;
            } else if (tipo === "produccion") {
                snippet = `%_Simbolo <= %_No_Terminal $_Terminal ;    #Establecer producciones`;
            } else if (tipo === "mayus-letras") {
                snippet = `[A-Z]`;
            } else if (tipo === "min-letras") {
                snippet = `[a-z]`;
            } else if (tipo === "letras-total") {
                snippet = `[aA-zZ]`;
            } else if (tipo === "numeros") {
                snippet = `[0-9]`;
            }

            if (!snippet) return;

            const actual = this.codigoGramatica;

            if (!textArea) {
                this.codigoGramatica += (actual ? "\n" : "") + snippet;
                this.logConsola += `\n\n[INFO] Preset "${tipo}" agregado al final.`;
                return;
            }

            const inicio = textArea.selectionStart;
            const fin = textArea.selectionEnd;

            const textoAntes = actual.substring(0, inicio);
            const textoDespues = actual.substring(fin);


            this.codigoGramatica = textoAntes + snippet + textoDespues;

            await tick();

            const nuevaPosicion = inicio + snippet.length;

            textArea.focus();
            textArea.setSelectionRange(nuevaPosicion, nuevaPosicion);

            this.actualizarPosicion(textArea);
        },

        // Metodo para cuando el usuario le da a guardar en el modal y se guarda la gramatica
        guardarGramatica(nombre) {

            this.mostrarModalExito = false;

            /*Metodo que permite generar los archivos para generar el analizador PATRON EXPERTO */
            const {nombreArchivo, lexerJison, parserLL } = this.gestorCompilacion.generarAnalizadorLL(nombre);

            /*Pendiente hacer el POST a la API (PATRON EXPERTO) */

            console.log(nombreArchivo);
            console.log("\n");
            console.log(lexerJison);
            

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

                this.logConsola += "\n\n[INFO] Sintaxis correcta. Iniciando analisis semantico...";

                /*Delegacion de validacion al analizador semantico de la gramatica  */
                /*Validacion y retorno (PATRON EXPERTO) */
                const { astValidado, errores: erroresSemanticos } = gestorCompilacion.generarAnalisis(ast);

                if (erroresSemanticos.length > 0) {

                    this.errores = [...this.errores, ...erroresSemanticos];

                    this.logConsola += `\n\n[ERROR] Analisis Semantico fallo con ${erroresSemanticos.length} errores.`;
                    this.mostrarErrores = true;
                    return null; 
                }

                this.logConsola += "\n\n[EXITOSO] Analisis completado con exito.";

                //Guardado del AST para la siguiente fase de generacion LL(1)
                astGenerado = astValidado;
                
                /*Fase de generacion dela tabla LL(1)  (SEGUNDA FASE)*/

                const { erroresAmbiguos } = gestorCompilacion.generarLL1();

                if (erroresAmbiguos.length > 0) {

                    this.errores = [...this.errores, ...erroresAmbiguos];

                    this.logConsola += `\n\n[AMBIGUEDAD] Se ha detectado ambiguedad. Se registraron: ${erroresAmbiguos.length} colisiones.`;

                    this.mostrarErrores = true;
                    return null; 
                }


                this.mostrarModalExito = true;

                return astValidado;

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

/*Created by Pablo */
    };
}