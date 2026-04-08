package com.pablocompany.rest.api.practicano2.compi1.parsers.services;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.DatosNoEncontradosException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.database.WisonCompilerDB;
import com.pablocompany.rest.api.practicano2.compi1.parsers.dtos.GramaticaRequest;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.Gramatica;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaModelDTO;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

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
    
    //Metodo que permite retornar el listado de gramaticas paginadas
    public List<GramaticaModelDTO> obtenerGramaticasListado(String limite, String inicio) throws ErrorInesperadoException, DatosNoEncontradosException, FormatoInvalidoException {

        if (!StringUtils.isNumeric(limite)) {
            throw new FormatoInvalidoException("El limite del paginado no es numerico");
        }

        if (!StringUtils.isNumeric(inicio)) {
            throw new FormatoInvalidoException("El inicio del paginado no es numerico");
        }

        int limitInt = Integer.parseInt(limite);
        int offsetInt = Integer.parseInt(inicio);

        WisonCompilerDB wisonDb = new WisonCompilerDB();

        return wisonDb.gramaticasRegistradas(limitInt, offsetInt);
    }

}
