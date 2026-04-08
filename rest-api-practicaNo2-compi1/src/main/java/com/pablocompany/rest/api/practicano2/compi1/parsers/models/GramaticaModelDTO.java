
package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

/**
 *
 * @author pablo03
 */

/*Clase delegada para reperesntar el modelo base de la gramatica*/
public class GramaticaModelDTO {
   
    private String id;
    private String nombreGramatica;
    private String fecha;
    private String hora;

    public GramaticaModelDTO() {
    }
    
    public GramaticaModelDTO(String id, String nombreGramatica, String fecha, String hora) {
        this.id = id;
        this.nombreGramatica = nombreGramatica;
        this.fecha = fecha;
        this.hora = hora;
    }
    
    /*Metodos getter y setter de la clase*/

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombreGramatica() {
        return nombreGramatica;
    }

    public void setNombreGramatica(String nombreGramatica) {
        this.nombreGramatica = nombreGramatica;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }
    
}
