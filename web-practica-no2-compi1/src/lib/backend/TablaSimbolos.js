/*Clase delegada para poder manejar a la tabla de simbolos primitiva de la gramatica*/

export default class TablaSimbolos{

    /*Inicializacion de la tabla de simbolos */
    constructor(){
        this.tabla = new Map();
    }

    /*Metodo que permite agregar un nuevo simbolo */
    agregar(simbolo){
        this.tabla.set(simbolo.id, simbolo);
    }

    /*Metodo que permite obtener algun simbolo ya registrado dentro */
    obtener(id){
        return this.tabla.get(id);
    }

    /*Metodo que permite evaluar si existe ya un simbolo registrado*/
    existe(id){
        return this.tabla.has(id);
    }

    /*Metodo que permite limpiar la tabla de simbolos */
    limpiar(){
        this.tabla.clear();
    }
}
/*Created by Pablo */