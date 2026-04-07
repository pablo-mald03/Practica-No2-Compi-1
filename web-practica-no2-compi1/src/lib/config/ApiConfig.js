export class ApiConfig {
    /**
     * Metodo que retorna la URL base de la API.
     * @returns {string}
     */
    static getBaseUrl() {
       
        return "http://localhost:8080/rest-api-practicaNo2-compi1/api/v1";
    }


    /**
     * Metodo que retorna el endpoint especifico para las gramaticas.
     * @returns {string}
     */
    static getGramaticasUrl() {
        return `${this.getBaseUrl()}/wison`;
    }

}