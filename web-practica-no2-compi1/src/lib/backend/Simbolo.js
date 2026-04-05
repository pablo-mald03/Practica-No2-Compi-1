/*Clase delegada para poder representar a los simbolos para poder manejar la validacion semantica */

export default class Simbolo {

    /*constructor del simbolo*/

    constructor(id, tipo, categoria, linear, columna) {
        this.id = id;             
        this.tipo = tipo;         
        this.categoria = categoria; 
        this.linea = linea;
        this.columna = columna;
    }
}