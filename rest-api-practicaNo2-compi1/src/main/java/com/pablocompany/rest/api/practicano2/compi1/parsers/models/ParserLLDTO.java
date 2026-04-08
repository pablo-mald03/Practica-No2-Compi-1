
package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

/**
 *
 * @author pablo03
 */
/*Clase delegada para poder reperesentar al PARSER y el LEXER almacenados en la base de datos*/
public class ParserLLDTO {
    
    //Atributos
    private String nombreArchivo;
    private String lexer;
    private String parser;

    public ParserLLDTO(String nombreArchivo, String lexer, String parser) {
        this.nombreArchivo = nombreArchivo;
        this.lexer = lexer;
        this.parser = parser;
    }
    
    /*Metodos getters y setters*/
    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getLexer() {
        return lexer;
    }

    public void setLexer(String lexer) {
        this.lexer = lexer;
    }

    public String getParser() {
        return parser;
    }

    public void setParser(String parser) {
        this.parser = parser;
    }

    
    
}
