package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.dtos.GramaticaRequest;
import org.apache.commons.lang3.StringUtils;

/**
 *
 * @author pablo03
 */
/*Clase delegada para poder representar el DTO para poder procesar los datos*/
public class GramaticaDTO {

    private String nombreArchivo;
    private String lexer;
    private String parser;

    public GramaticaDTO(GramaticaRequest gramaticaRequest) {
        this.nombreArchivo = gramaticaRequest.getNombreArchivo();
        this.lexer = gramaticaRequest.getLexer();
        this.parser = gramaticaRequest.getParser();

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

    /*Metodo delegado para que se pueda validar el objeto entrante*/
    public boolean validarEntradas() throws FormatoInvalidoException {

        if (StringUtils.isEmpty(this.nombreArchivo)) {
            throw new FormatoInvalidoException("El nombre de la gramatica esta vacio");
        }

        if (StringUtils.isEmpty(this.lexer)) {
            throw new FormatoInvalidoException("El Analizador Lexico de la gramatica esta vacio");
        }
        
        if (StringUtils.isEmpty(this.parser)) {
            throw new FormatoInvalidoException("El Analizador Sintactico de la gramatica esta vacio");
        }

        return true;
    }

}
