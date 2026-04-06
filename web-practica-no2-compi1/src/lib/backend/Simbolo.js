/*Clase delegada para poder representar a los simbolos para poder manejar la validacion semantica */

export default class Simbolo {

    /*constructor del simbolo*/

    constructor(id, tipo, linea, columna, regla = null) {
        this.id = id;
        this.tipo = tipo;
        this.linea = linea;
        this.columna = columna;
        this.regla = regla;
    }

    /*Metodos getter para obtener los atributos del simbolo */
    get getId() {
        return this.id;
    }
    get getTipo() {
        return this.tipo;
    }
    get getLinea() {
        return this.linea;
    }
    get getColumna() {
        return this.columna;
    }

    get getRegla() {
        return this.regla;
    }

}
/*Created by Pablo */