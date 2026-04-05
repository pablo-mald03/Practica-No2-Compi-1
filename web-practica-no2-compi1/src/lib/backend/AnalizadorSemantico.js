//Clase delegada para poder realizar el respectivo analisis semantico del codigo
export default class AnalizadorSemantico {

    constructor(ast) {
        this.ast = ast;
        this.erroresSemanticos = [];
    }

    /*Metodo delegado para poder generar el analisis semantico (PATRON EXPERTO)*/
    analizarCodigo() {
        if (!this.ast) return { ast: null, errores: [{ descripcion: "AST nulo o inválido" }] };


        return {
            errores: this.erroresSemanticos,
            astFinal: this.ast
        };
    }

}