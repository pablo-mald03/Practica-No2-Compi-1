/*Clase delegada para representar el objeto DTO que se envia hacia la API*/

export class GramaticaDTO {
    constructor(nombreArchivo, lexer, parser) {
        this.nombreArchivo = nombreArchivo;
        this.lexer = lexer;
        this.parser = parser;
    }
}