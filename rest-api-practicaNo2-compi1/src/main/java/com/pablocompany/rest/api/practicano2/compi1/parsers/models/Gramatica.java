
package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

import java.io.InputStream;

/**
 *
 * @author pablo03
 */

/*Clase que representa el objeto original que se va a almacenar en la base de datos*/
public class Gramatica {
    
    private String nombreGramatica;
    private InputStream lexerStream;
    private InputStream parserStream;

    public Gramatica() {
        
    }

    public Gramatica(String nombreGramatica, InputStream lexerStream, InputStream parserStream) {
        this.nombreGramatica = nombreGramatica;
        this.lexerStream = lexerStream;
        this.parserStream = parserStream;
    }
    
    
    /*Getters y setters de la clase*/
    public String getNombreGramatica() {
        return nombreGramatica;
    }

    public void setNombreGramatica(String nombreGramatica) {
        this.nombreGramatica = nombreGramatica;
    }

    public InputStream getLexerStream() {
        return lexerStream;
    }

    public void setLexerStream(InputStream lexerStream) {
        this.lexerStream = lexerStream;
    }

    public InputStream getParserStream() {
        return parserStream;
    }

    public void setParserStream(InputStream parserStream) {
        this.parserStream = parserStream;
    }
    
    
    
}
