/*Imports de la clase */
import TablaSimbolos from "./TablaSimbolos.js";
import AnalizadorSemantico from "./AnalizadorSemantico.js";
import GestorTablaLL from "./recursos-parser/GestorTablaLL.js";

/*Clase delegada que representa el gestor de todo el backend que requiera la aplicacion */

export default class GestorCompilador {

    constructor() {
        this.ast = null;
        this.tablaSimbolosGlobal = new TablaSimbolos();
        this.gestorTablaLL = null;

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


    /*Metodo que permite limpiar el gestor (Para siempre mantener a la referencia viva) */
    limpiarEntorno() {
        this.ast = null;
        this.tablaSimbolosGlobal.limpiar();
        this.gestorTablaLL = null;
        this.tablaLL1 = null;
    }

}
