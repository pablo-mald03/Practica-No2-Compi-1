/*Imports de la clase */
import TablaSimbolos from "./TablaSimbolos.js";
import AnalizadorSemantico from "./AnalizadorSemantico.js";
import GestorTablaLL from "./recursos-parser/GestorTablaLL.js";
import GestorAnalizadorLL from "./recursos-parser/GestorAnalizadorLL.js";

/*Clase delegada que representa el gestor de todo el backend que requiera la aplicacion */

export default class GestorCompilador {

    constructor() {
        this.ast = null;
        this.tablaSimbolosGlobal = new TablaSimbolos();
        this.gestorTablaLL = null;
        this.gestorAnalizadorLLTabla = null;

        /*Representacion de la tabla LL(1) */
        this.tablaLL1 = new Map();
    }

    /*Metodo que permite generar el analisis semantico */
    generarAnalisis(astJison) {

        this.limpiarEntorno();

        const semantico = new AnalizadorSemantico(astJison, this.tablaSimbolosGlobal);
        const resultado = semantico.analizarCodigo();

        if (resultado.errores.length === 0) {
            this.ast = resultado.astFinal;
            this.tablaSimbolosGlobal = resultado.tablaSimbolosFinal;
        } else {
            this.tablaSimbolosGlobal = new TablaSimbolos();
        }

        return {
            astValidado: this.ast,
            errores: resultado.errores
        };
    }


    /*FASE 2: Generacion del analizador sintactico LL(1) */
    generarLL1() {
        if (!this.ast) {
            return {
                erroresAmbiguos: []
            };
        }

        this.gestorTablaLL = new GestorTablaLL(this.ast, this.tablaSimbolosGlobal);

        const resultado = this.gestorTablaLL.procesarTablaLL();

        this.tablaLL1 = resultado.tabla;

        return {
            erroresAmbiguos: resultado.erroresAmbiguedad
        };

    }

    /*FASE 3: Generar el analizador sintactico recursivo para poder subirlo a la API y generar persistencia*/
    generarAnalizadorLL(nombreAnalizador) {

        if (!this.ast) {
            return {
                lexerJison: "",
                parserLL: ""
            };
        }

        this.gestorAnalizadorLLTabla = new GestorAnalizadorLL(this.ast, this.tablaLL1, this.tablaSimbolosGlobal);

        const { nombreGenerado, lexerGenerado, parserGenerado } = this.gestorAnalizadorLLTabla.generarAnalizadores(nombreAnalizador);


        return {
            nombreArchivo: nombreGenerado,
            lexerJison: lexerGenerado,
            parserLL: parserGenerado
        };

    }

    /*Metodo que permite reorganizar las expresiones regulares que son macros y evitar colisiones con los macros*/
    listaTerminalesAjustados() {
        if (!this.tablaSimbolosGlobal) {
            return {
                listaTerminales: []
            };
        }

        let listaMacros = [];

        let indice = 0;

/*
        for (let instruccion of this.ast.lexico) {

            if (instruccion.tipo === 'TERMINAL') {

                const idTerminal = instruccion.id;

                //Verificacion si el simbolo ya existe
                if (this.tablaSimbolos.obtener(idTerminal)) {

                    this.agregarError(
                        idTerminal,
                        `El terminal '${idTerminal}' ya ha sido declarado previamente.`,
                        instruccion.fila,
                        instruccion.columna
                    );

                } else {

                    const nuevoSimbolo = new Simbolo(
                        idTerminal,
                        TipoSimbolo.TERMINAL,
                        instruccion.fila,
                        instruccion.columna,
                        instruccion.regla
                    );

                    this.tablaSimbolos.agregar(nuevoSimbolo);

                }

            }
        }

*/
        /* for (let instruccion of instrucciones) {
            if (instruccion.tipo === 'DECLARACION_NO_TERMINAL') {
                const idNoTerminal = instruccion.id;

                // 1. Verificamos si ya existe en la tabla
                if (this.tablaSimbolos.existe(idNoTerminal)) {*/
    }


    /*Metodo que permite limpiar el gestor (Para siempre mantener a la referencia viva) */
    limpiarEntorno() {
        this.ast = null;
        this.tablaSimbolosGlobal.limpiar();
        this.gestorTablaLL = null;
        this.tablaLL1 = null;
        this.gestorAnalizadorLLTabla = null;
    }

}
/*Created by Pablo */