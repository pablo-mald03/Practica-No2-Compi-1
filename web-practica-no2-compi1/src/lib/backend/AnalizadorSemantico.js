/*Imports de la clase */
import TablaSimbolos from "./TablaSimbolos.js";
import Simbolo from "./Simbolo.js";

//Clase delegada para poder realizar el respectivo analisis semantico del codigo
export default class AnalizadorSemantico {

    constructor(ast) {
        this.ast = ast;
        this.erroresSemanticos = [];

        this.tablaTerminales = new TablaSimbolos();
        this.tablaNoTerminales = new TablaSimbolos();

        this.tieneSimboloInicial = false;
    }

    /*Metodo delegado para poder generar el analisis semantico (PATRON EXPERTO)*/
    analizarCodigo() {
        if (!this.ast) {
            return {
                ast: null, errores: [{
                    lexema: "AST NULO",
                    tipo: "Semantico",
                    fila: -1,
                    columna: -1,
                    descripcion: "AST nulo o invalido"
                }]
            };
        }

        /*Delegacion de validacion de la parte lexica de wison */
        this.procesarParteLexica();

        /*Delegacion de validacion de la parte sintactica de wison */
        this.procesarParteLexica();



        return {
            errores: this.erroresSemanticos,
            astFinal: this.ast
        };
    
    }

    /*Metodo que permite ejecutar la validacion del apartado lexico de Wison */
    procesarParteLexica(){

    }

    /*Metodo que permite ejecutar la validacion del apartado sintactico de Wison */
    procesarParteSintactica(){
        
    }

    /*Metodo que permite agregar los erroes a la lista */
    agregarError(lex, descripcion,fila,columna){
        this.erroresSemanticos.push({
            lexema: lex,
            tipo: "Semantico",
            fila: fila,
            columna: columna,
            descripcion: desc

        });
    }

}