package com.pablocompany.rest.api.practicano2.compi1.parsers.database;

import com.pablocompany.rest.api.practicano2.compi1.exceptions.DatosNoEncontradosException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.ErrorInesperadoException;
import com.pablocompany.rest.api.practicano2.compi1.exceptions.FormatoInvalidoException;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.Gramatica;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.GramaticaModelDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.ParserDescargaDTO;
import com.pablocompany.rest.api.practicano2.compi1.parsers.models.ParserLLDTO;
import com.pablocompany.rest.api.practicano2.compi1.resources.connection.DBConnectionSingleton;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author pablo03
 */
/*Clase delegada para poder comunicarse con la base de datos*/
public class WisonCompilerDB {

    //Constante que permite insertar una gramatica a la base de datos
    private static final String INSERT_GRAMATICA = "INSERT INTO wison (filename,lexer, parser) VALUES (?, ?, ?)";

    //Constante que permite consultar todos las las gramaticas (paginacion)
    private static final String OBTENER_TODOS = "SELECT id, filename, fecha_publicacion, hora_publicacion FROM wison ORDER BY fecha_publicacion DESC LIMIT ? OFFSET ?";

    //Constante que permite obtener los analizadores de la gramatica 
    private static final String OBTENER_GRAMATICA = "SELECT filename, lexer, parser FROM wison WHERE id = ?";
    
    //Constante que permite descargar la gramatica 
    private static final String OBTENER_DESCARGA_GRAMATICA = "SELECT filename, parser FROM wison WHERE id = ?";

    //Metodo que sirve para poder almacenar una gramatica en el sistema
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

    //Metodo que sirve para poder generar la transaccion para insertar la gramatica
    public int subirFormulario(Gramatica referenciaGramatica, Connection conexion) throws SQLException, FormatoInvalidoException {

        try (PreparedStatement preparedStmt = conexion.prepareStatement(INSERT_GRAMATICA);) {
            preparedStmt.setString(1, referenciaGramatica.getNombreGramatica().trim());
            preparedStmt.setBlob(2, referenciaGramatica.getLexerStream());
            preparedStmt.setBlob(3, referenciaGramatica.getParserStream());

            int filasAfectadas = preparedStmt.executeUpdate();
            return filasAfectadas;
        }
    }

    /*Metodo que permite obtener las gramaticas almacenadas*/
    public List<GramaticaModelDTO> gramaticasRegistradas(int limite, int inicio) throws ErrorInesperadoException {
        List<GramaticaModelDTO> listaGramaticas = new ArrayList<>();
        SimpleDateFormat fmtFecha = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat fmtHora = new SimpleDateFormat("HH:mm:ss");

        try (Connection connection = DBConnectionSingleton.getInstance().getConnection(); PreparedStatement query = connection.prepareStatement(OBTENER_TODOS)) {

            query.setInt(1, limite);
            query.setInt(2, inicio);

            ResultSet resultSet = query.executeQuery();

            while (resultSet.next()) {
                String id = String.valueOf(resultSet.getInt("id"));
                String filename = resultSet.getString("filename");
                java.sql.Date sqlFecha = resultSet.getDate("fecha_publicacion");
                java.sql.Time sqlHora = resultSet.getTime("hora_publicacion");

                String fechaStr = (sqlFecha != null) ? fmtFecha.format(sqlFecha) : "0000-00-00";
                String horaStr = (sqlHora != null) ? fmtHora.format(sqlHora) : "00:00:00";

                listaGramaticas.add(new GramaticaModelDTO(id, filename, fechaStr, horaStr));
            }
        } catch (SQLException e) {
            throw new ErrorInesperadoException("Error al obtener el listado de gramaticas paginado: " + e.getMessage());
        }

        return listaGramaticas;
    }

    /*Metodo delegado para poder obtener los analizadores de la gramatica solicitada*/
    public ParserLLDTO obtenerAnalizadores(int id) throws ErrorInesperadoException, DatosNoEncontradosException {
        try (Connection conexion = DBConnectionSingleton.getInstance().getConnection(); PreparedStatement query = conexion.prepareStatement(OBTENER_GRAMATICA)) {

            query.setInt(1, id);

            try (ResultSet rs = query.executeQuery()) {
                if (rs.next()) {

                    byte[] lexerBytes = rs.getBytes("lexer");
                    byte[] parserBytes = rs.getBytes("parser");

                    String lexerTexto = new String(lexerBytes, StandardCharsets.UTF_8);
                    String parserTexto = new String(parserBytes, StandardCharsets.UTF_8);

                    return new ParserLLDTO(
                            rs.getString("filename"),
                            lexerTexto,
                            parserTexto
                    );
                }
            }

        } catch (SQLException e) {
            throw new ErrorInesperadoException("Error al recuperar el archivo de la gramatica");
        }
        throw new DatosNoEncontradosException("No se ha encontrado una gramatica con el ID solicitado");
    }
    
    /*Metodo que permite obtener el archivo del parser*/
      public ParserDescargaDTO obtenerArchivoBinario(int id) throws ErrorInesperadoException, DatosNoEncontradosException {
        try (Connection conexion = DBConnectionSingleton.getInstance().getConnection(); PreparedStatement query = conexion.prepareStatement(OBTENER_DESCARGA_GRAMATICA)) {

            query.setInt(1, id);

            try (ResultSet rs = query.executeQuery()) {
                if (rs.next()) {
                    return new ParserDescargaDTO(
                            rs.getString("filename"),
                            rs.getBytes("parser")
                    );
                }
            }

        } catch (SQLException e) {
            throw new ErrorInesperadoException("Error al recuperar el archivo del parser binario");
        }

        throw new DatosNoEncontradosException("No se ha encontrado el parser con el ID solicitado");
    }

}
