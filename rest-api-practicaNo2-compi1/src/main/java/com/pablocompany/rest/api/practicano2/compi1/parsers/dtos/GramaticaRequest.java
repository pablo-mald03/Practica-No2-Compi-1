
package com.pablocompany.rest.api.practicano2.compi1.parsers.dtos;

/**
 *
 * @author pablo03
 */
/*Clase delegada que representa a la gramatica que viene en el request*/
public class GramaticaRequest {
    
    private String nombreArchivo;
    private String lexer;
    private String parser;

    public GramaticaRequest() {
    }

    public GramaticaRequest(String nombreArchivo, String lexer, String parser) {
        this.nombreArchivo = nombreArchivo;
        this.lexer = lexer;
        this.parser = parser;
    }

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
