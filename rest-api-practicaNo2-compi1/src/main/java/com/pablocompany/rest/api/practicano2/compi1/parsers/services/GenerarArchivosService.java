
package com.pablocompany.rest.api.practicano2.compi1.parsers.services;

import com.pablocompany.rest.api.practicano2.compi1.parsers.models.Gramatica;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaDTO;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 *
 * @author pablo03
 */

/*Clase delegada para poder tranformar los archivos de entrada en .js*/
public class GenerarArchivosService {
    
    /*Metodo delegado que retorna el obtejo armado con el lexer y parser ya transformados en streams*/
    public Gramatica generarObjetoGramatica(GramaticaDTO dto){
        
        String nombre = dto.getNombreArchivo();
        InputStream lexerStream = convertirStringAStream(dto.getLexer());
        InputStream parserStream = convertirStringAStream(dto.getParser());
        
        return new Gramatica(nombre, lexerStream, parserStream);
    }
    
    /*Metodo delegado para poder generar el input stream de las cadenas de strings recibidas*/
    private InputStream convertirStringAStream(String contenido) {
        if (contenido == null || contenido.trim().isEmpty()) {
            return null; 
        }
        
        byte[] bytesDelContenido = contenido.getBytes(StandardCharsets.UTF_8);
        
        return new ByteArrayInputStream(bytesDelContenido);
    }
    
}
