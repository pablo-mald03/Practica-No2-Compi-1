package com.pablocompany.rest.api.practicano2.compi1.exceptions;

/**
 *
 * @author pablo03
 */
//Excepcion que representa cualquier error con el servidor
public class ErrorInesperadoException extends Exception{

    public ErrorInesperadoException(String message) {
        super(message);
    }
    
}
