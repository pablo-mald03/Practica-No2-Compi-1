
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