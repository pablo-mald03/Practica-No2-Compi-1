/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pablocompany.rest.api.practicano2.compi1.resources.wisonparser;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.dtos.GramaticaRequest;
import com.pablocompany.rest.api.practicano2.compi1.parsers.services.GramaticaService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/**
 *
 * @author pablo03
 */
@Path("wison")
public class WisonResource {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response subirGramatica(GramaticaRequest gramatica) {

        GramaticaService service = new GramaticaService();

        try {

            /*PATRON EXPERTO*/
            if (service.almacenarGramatica(gramatica)) {
                return Response.status(Response.Status.CREATED).build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("mensaje", "No se pudo almacenar la gramatica en la API")).build();
            }

        } catch (FormatoInvalidoException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("mensaje", ex.getMessage())).build();
        } catch (ErrorInesperadoException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("mensaje", ex.getMessage())).build();
        }

    }

}
