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

    //Metodo que permite retornar las gramaticas subidas en la API
    static getListadoUrl(limite, inicio) {
        return `${this.getGramaticasUrl()}/uploaded/limit/${limite}/offset/${inicio}`;
    }

    /*Metodo que permite conectar con el endpoint para poder obtener los datos del analizador */
    static getAnalizadorUrl(id) {
        return `${this.getGramaticasUrl()}/analizador/${id}`;
    }

    /* Metodo que permite conectar con el endpoint para descargar el parser de la gramatica */
    static getDescargarParserUrl(id) {
        return `${this.getGramaticasUrl()}/descargar/${id}`;
    }

}