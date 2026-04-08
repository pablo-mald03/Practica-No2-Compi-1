
/*Imports de la clase*/
import { ApiConfig } from "$lib/config/ApiConfig"


/*Metodo delegado para poder realizar los requests con la API*/
/**
 * Servicio para guardar la gramatica en el backend.
 * @param {GramaticaDTO} dto - DTO de la gramatica.
 * @returns {Promise<boolean>} Retorna true si fue exitoso, lanza un error si falla.
 */
export const guardarGramaticaAPI = async (dto) => {
    const endpoint = ApiConfig.getGramaticasUrl();
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || "Error en el servidor");
        } else {
            const textoError = await response.text();
            console.error("Respuesta no-JSON del servidor:", textoError);
            throw new Error(`Error del servidor (${response.status}). Revisa la consola de red.`);
        }
    }
    return true;
};

/*REQUEST QUE PERMITE RETORNAR LA CANTIDAD DE GRAMATICAS CARGADAS EN LA API*/
export const obtenerGramaticasAPI = async (limite, inicio) => {
    const endpoint = ApiConfig.getListadoUrl(limite, inicio);

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensaje || `Error al obtener listado (${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("[GramaticaService] Error en GET:", error);
        throw error;
    }
};

/*REQUEST QUE PERMITE RETORNAR EL DTO CON LOS STRINGS DEL LEXER Y PARSER*/
export const obtenerAnalizadorAPI = async (id) => {
    const endpoint = ApiConfig.getAnalizadorUrl(id);

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            // Capturamos el Map.of("mensaje", e.getMessage()) que mandas desde Java
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensaje || `Error al obtener el analizador (${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("[GramaticaService] Error en GET Analizador:", error);
        throw error;
    }
};

/* REQUEST QUE PERMITE DESCARGAR EL ARCHIVO DEL PARSER (.js) */
export const descargarParserAPI = async (id) => {
    const endpoint = ApiConfig.getDescargarParserUrl(id);

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 
                'Accept': 'application/octet-stream, application/json' 
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensaje || `Error al descargar el parser (${response.status})`);
        }

        let filename = "parser.js"; 
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
            const matches = /filename="([^"]+)"/.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1];
            }
        }

        const blob = await response.blob();

        return { blob, filename };

    } catch (error) {
        console.error("[GramaticaService] Error en GET Descargar Parser:", error);
        throw error;
    }
};