
package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

/**
 *
 * @author pablo03
 */
/*Clase delegada para poder reperesentar al PARSER y el LEXER almacenados en la base de datos*/
public class ParserLLDTO {
    
    //Atributos
    private String nombreArchivo;
    private byte [] lexer;
    private byte [] parser;

    public ParserLLDTO(String nombreArchivo, byte[] lexer, byte[] parser) {
        this.nombreArchivo = nombreArchivo;
        this.lexer = lexer;
        this.parser = parser;
    }
    
    /*Metodos getter y setter*/
    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public byte[] getLexer() {
        return lexer;
    }

    public void setLexer(byte[] lexer) {
        this.lexer = lexer;
    }

    public byte[] getParser() {
        return parser;
    }

    public void setParser(byte[] parser) {
        this.parser = parser;
    }

    
}
