package com.pablocompany.rest.api.practicano2.compi1.parsers.services;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.database.WisonCompilerDB;
import com.pablocompany.rest.api.practicano2.compi1.parsers.dtos.GramaticaRequest;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.Gramatica;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaDTO;

/**
 *
 * @author pablo03
 */

/*Clase delegada para poder procesar todos los requests (PATRON EXPERTO)*/
public class GramaticaService {

    /*Metodo delegado para poder almacenar la gramatica*/
    public boolean almacenarGramatica(GramaticaRequest gramatica) throws FormatoInvalidoException, ErrorInesperadoException {

        GramaticaDTO gramaticaDTO = new GramaticaDTO(gramatica);

        if (gramaticaDTO.validarEntradas()) {

            GenerarArchivosService generacionArchivos = new GenerarArchivosService();

            Gramatica gramaticaNueva = generacionArchivos.generarObjetoGramatica(gramaticaDTO);

            WisonCompilerDB wisonDb = new WisonCompilerDB();

            return wisonDb.insertarGramatica(gramaticaNueva);

        }

        throw new ErrorInesperadoException("No se ha podido almacenar la gamatica en la base de datos");
    }

}
