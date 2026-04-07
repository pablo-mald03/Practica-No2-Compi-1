package com.pablocompany.rest.api.practicano2.compi1;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * Configures Jakarta RESTful Web Services for the application.
 * @author Juneau
 */
@ApplicationPath("api/v1")
public class JakartaRestConfiguration extends ResourceConfig {

    //Configuracion multipart
    public JakartaRestConfiguration() {

        packages("com.pablocompany.rest.api.practicano2.compi1.resources");
        register(MultiPartFeature.class);

    }

}
