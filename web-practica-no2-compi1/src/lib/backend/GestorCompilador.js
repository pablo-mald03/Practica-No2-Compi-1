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

        let listadoLimpio = this.listaTerminalesAjustados();

        this.gestorAnalizadorLLTabla = new GestorAnalizadorLL(this.ast, this.tablaLL1, this.tablaSimbolosGlobal, listadoLimpio);

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

        let listaMacros = new Set();
        let listaTerminales = [];

        for (let instruccion of this.ast.lexico) {
            if (instruccion.tipo === 'TERMINAL') {
                this.encontrarTerminales(instruccion.regla, listaMacros);
                listaTerminales.push(instruccion);
            }
        }

        let listaOrdenada = this.listarTerminalesOrden(listaMacros,listaTerminales);

        return listaOrdenada;
    }


    /*Metodo que permite poder generar la logica para poder reorganizar los macros*/
    listarTerminalesOrden(listaMacros, listaTerminales) {

        let listaTerminalesRegulares = [];
        let listaTerminalesMacros = [];

        /*Fase 1: pick de terminales*/

        for (let terminal of listaTerminales) {
            
            if (listaMacros.has(terminal.id)) {

                listaTerminalesMacros.push(terminal);
            } else {
 
                listaTerminalesRegulares.push(terminal);
            }
        }

        //Fase 2: hacer el pop para dejar la lista tal cual solo con los macros abajo
        let listaLimpia = listaTerminalesRegulares.concat(listaTerminalesMacros);

        return listaLimpia;
    }


    /*Metodo utilizado para poder retornar el listado de  los terminales que tienen macros ajustados*/
    encontrarTerminales(elementos, listaMacros) {

        for (let elemento of elementos) {
            const unidad = elemento.unidad;

            if (unidad.tipo === 'REFERENCIA_ID') {
                const idMacro = unidad.valor;
                const simboloReferenciado = this.tablaSimbolosGlobal.obtener(idMacro);

                if (simboloReferenciado) {
                    listaMacros.add(idMacro); 
                }
            }
            else if (unidad.tipo === 'AGRUPACION') {
                this.encontrarTerminales(unidad.contenido, listaMacros);
            }
        }
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