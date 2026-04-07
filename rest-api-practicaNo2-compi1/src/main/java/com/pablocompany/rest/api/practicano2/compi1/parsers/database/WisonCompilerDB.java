
package com.pablocompany.rest.api.practicano2.compi1.parsers.database;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.Gramatica;
import com.pablocompany.rest.api.practicano2.compi1.resources.connection.DBConnectionSingleton;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 *
 * @author pablo03
 */
/*Clase delegada para poder comunicarse con la base de datos*/
public class WisonCompilerDB {
    
     //Constante que permite insertar un formulario a la base de datos
    private static final String INSERT_GRAMATICA = "INSERT INTO wison (filename,lexer, parser) VALUES (?, ?, ?)";

    //Constante que permite consultar todos los formularios (sin paginacion)
    private static final String OBTENER_TODOS = "SELECT id, filename, fecha_publicacion, hora_publicacion FROM wison LIMIT ? OFFSET ? DESC";

    //Constante que permite obtener el contenido dentro del formulario 
    private static final String OBTENER_GRAMATICA = "SELECT filename, archivo FROM wison WHERE id = ?";
    
    
    //Metodo que sirve para poder registrar un usuario en el sistema
    public boolean insertarGramatica(Gramatica referenciaGramatica) throws ErrorInesperadoException, FormatoInvalidoException {

        try (Connection conexion = DBConnectionSingleton.getInstance().getConnection()) {

            try {
                conexion.setAutoCommit(false);

                int filasAfectadas = subirFormulario(referenciaGramatica, conexion);

                if (filasAfectadas > 0) {
                    conexion.commit();
                    conexion.setAutoCommit(true);
                    return true;
                } else {
                    conexion.rollback();
                    throw new ErrorInesperadoException("No se ha podido registrar el formulario.");
                }

            } catch (SQLException | FormatoInvalidoException ex) {
                try {
                    if (conexion != null) {
                        conexion.rollback();
                    }
                } catch (SQLException rollbackEx) {
                    throw new ErrorInesperadoException("Error crítico al hacer Rollback.");
                }
                throw new ErrorInesperadoException("Error al subir la nueva gramatica: " + ex.getMessage());
            } finally {
            }

        } catch (SQLException ex) {
            throw new ErrorInesperadoException("Error de conexion con la base de datos.");
        }

    }

    //Metodo que sirve para poder generar la transaccion para insertar al usuario y crearle su registro a su bileltera digital
    public int subirFormulario(Gramatica referenciaGramatica, Connection conexion) throws SQLException, FormatoInvalidoException {

        try (PreparedStatement preparedStmt = conexion.prepareStatement(INSERT_GRAMATICA);) {
            preparedStmt.setString(1, referenciaGramatica.getNombreGramatica().trim());
            preparedStmt.setBlob(2, referenciaGramatica.getLexerStream());
            preparedStmt.setBlob(3, referenciaGramatica.getParserStream());

            int filasAfectadas = preparedStmt.executeUpdate();
            return filasAfectadas;
        }
    }

    
}
