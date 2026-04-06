/*Imports de la clase */
import TablaSimbolos from "./TablaSimbolos.js";
import AnalizadorSemantico from "./AnalizadorSemantico.js";

/*Clase delegada que representa el gestor de todo el backend que requiera la aplicacion */

export default class GestorCompilador {

    constructor() {
        this.ast = null;
        this.tablaSimbolosGlobal = new TablaSimbolos();
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
            return null;
        }


    }


    /*Metodo que permite limpiar el gestor (Para siempre mantener a la referencia viva) */
    limpiarEntorno() {
        this.ast = null;
        this.tablaSimbolosGlobal.limpiar();
    }

}
