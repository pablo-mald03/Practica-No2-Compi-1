/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pablocompany.rest.api.practicano2.compi1.resources.wisonparser;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.DatosNoEncontradosException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.dtos.GramaticaRequest;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaModelDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.ParserDescargaDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.ParserLLDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.services.GramaticaService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
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

    //Metodo que permite listar todos lod formularios
    @GET
    @Path("uploaded/limit/{limite}/offset/{inicio}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response gramaticasSubidas(
            @PathParam("limite") String limite,
            @PathParam("inicio") String inicio) {

        GramaticaService service = new GramaticaService();

        try {

            List<GramaticaModelDTO> lista = service.obtenerGramaticasListado(limite, inicio);
            return Response.ok(lista).build();

        } catch (DatosNoEncontradosException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(Map.of("mensaje", e.getMessage())).build();
        } catch (ErrorInesperadoException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("mensaje", ex.getMessage())).build();
        } catch (FormatoInvalidoException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("mensaje", ex.getMessage())).build();
        }

    }
    
    /*Metodo que permite descargar el archivo de la gramatica*/
    @GET
    @Path("descargar/{id}")
    @Produces({MediaType.APPLICATION_OCTET_STREAM, MediaType.APPLICATION_JSON})
    public Response descargarParser(@PathParam("id") String id) {
        try {
            GramaticaService service = new GramaticaService();
            ParserDescargaDTO formDescarga = service.obtenerParserDescarga(id);

            byte[] bytes = formDescarga.getContenido();

            return Response.ok(bytes)
                    .type(MediaType.APPLICATION_OCTET_STREAM)
                    .header("Content-Disposition", "attachment; filename=\"" + formDescarga.getNombre() + "\"")
                    .header("Content-Length", bytes.length)
                    .build();

        } catch (DatosNoEncontradosException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("mensaje", e.getMessage()))
                    .build();
        } catch (ErrorInesperadoException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("mensaje", ex.getMessage()))
                    .build();
        } catch (FormatoInvalidoException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("mensaje", ex.getMessage()))
                    .build();
        }
    }

    /*Metodo que permite obtener las gramaticas almacenadas*/
    @GET
    @Path("analizador/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerAnalizadores(@PathParam("id") String id) {
        try {
            GramaticaService service = new GramaticaService();
            ParserLLDTO parserData = service.obtenerGramaticaAnalisis(id);

            return Response.ok(parserData).build();

        } catch (DatosNoEncontradosException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(Map.of("mensaje", e.getMessage())).build();
        } catch (ErrorInesperadoException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("mensaje", ex.getMessage())).build();
        } catch (FormatoInvalidoException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(Map.of("mensaje", ex.getMessage())).build();
        }
    }

}
