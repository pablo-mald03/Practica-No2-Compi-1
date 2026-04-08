/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pablocompany.rest.api.practicano2.compi1.parsers.models;

/**
 *
 * @author pablo03
 */
/*Clase delegada para representar a lso parsers que se van a descargar para poderlos visualizar*/
public class ParserDescargaDTO {

    //Atributos
    private String nombre;
    private byte[] contenido;

    public ParserDescargaDTO(String nombre, byte[] contenido) {
        this.nombre = nombre;
        this.contenido = contenido;
    }

    //Metodos getters y setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public byte[] getContenido() {
        return contenido;
    }

    public void setContenido(byte[] contenido) {
        this.contenido = contenido;
    }
}
