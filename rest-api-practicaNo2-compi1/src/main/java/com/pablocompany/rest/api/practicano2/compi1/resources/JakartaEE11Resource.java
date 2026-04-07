package com.pablocompany.rest.api.practicano2.compi1.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

/**
 *
 * @author 
 */
/*Enpoint delegado para poder generar los requests para almacenar y manejar los datos de los parser LL(1) de Wison*/
@Path("wison")
public class JakartaEE11Resource {
    
    @GET
    public Response ping(){
        return Response
                .ok("ping Jakarta EE")
                .build();
    }
}
