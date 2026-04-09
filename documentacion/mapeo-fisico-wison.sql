#Mapeo fisico de la base de datos de la API

#Autenticacion de usuario en sql
mysql -u admindba -p 

#Creacion de la base de datos

CREATE DATABASE wisoncompilerdb;

#Acceder hacia la base de datos desde la terminal
USE wisoncompilerdb;


#Tabla para poder gestionar los parsers subidos

CREATE TABLE wison(
    id INT NOT NULL AUTO_INCREMENT,
    
    filename VARCHAR(250) NOT NULL,

    fecha_publicacion DATE DEFAULT (CURRENT_DATE),
    
    hora_publicacion TIME DEFAULT (CURRENT_TIME),
    
    lexer LONGBLOB NOT NULL,
    
    parser LONGBLOB NOT NULL,

    CONSTRAINT pk_wison PRIMARY KEY (id)
);

