/*Imports de la clase */
import TablaSimbolos from "./TablaSimbolos.js";
import Simbolo from "./Simbolo.js";

import { TipoSimbolo } from "./recursos-backend/TipoSimbolo.js";

//Clase delegada para poder realizar el respectivo analisis semantico del codigo
export default class AnalizadorSemantico {

    constructor(ast, tablaSimbolosGlobal) {
        this.ast = ast;
        this.erroresSemanticos = [];

        this.tablaSimbolos = tablaSimbolosGlobal;

        this.tieneSimboloInicial = false;
    }

    /*Metodo delegado para poder generar el analisis semantico (PATRON EXPERTO)*/
    analizarCodigo() {
        if (!this.ast) {
            return {
                ast: null, errores: [{
                    lexema: "AST NULO",
                    tipo: "Semantico",
                    fila: -1,
                    columna: -1,
                    descripcion: "AST nulo o invalido"
                }]
            };
        }

        /*Delegacion de validacion de la parte lexica de wison */
        this.procesarParteLexica();

        /*Delegacion de validacion de la parte sintactica de wison */
        this.procesarParteSintactica();

        return {
            errores: this.erroresSemanticos,
            astFinal: this.ast,
            tablaSimbolosFinal: this.tablaSimbolos
        };

    }

    /*Metodo que permite ejecutar la validacion del apartado lexico de Wison */
    procesarParteLexica() {
        if (!this.ast || !this.ast.lexico) {
            this.agregarError("AST", "La estructura de Wison esta incompleta.", -1, -1);
            return;
        }

        for (let instruccion of this.ast.lexico) {

            if (instruccion.tipo === 'TERMINAL') {

                const idTerminal = instruccion.id;

                //Verificacion si el simbolo ya existe
                if (this.tablaSimbolos.obtener(idTerminal)) {

                    this.agregarError(
                        idTerminal,
                        `El terminal '${idTerminal}' ya ha sido declarado previamente.`,
                        instruccion.fila,
                        instruccion.columna
                    );

                } else {

                    /*Guardado del terminal */
                    const nuevoSimbolo = new Simbolo(
                        idTerminal,
                        TipoSimbolo.TERMINAL,
                        instruccion.fila,
                        instruccion.columna,
                        instruccion.regla
                    );

                    this.tablaSimbolos.agregar(nuevoSimbolo);

                }

            }
        }

        this.verificarMacros();

    }

    /*Metodo auxiliar que permite validar que en las concatenaciones con macros tambien ya existan*/
    verificarMacros() {

        if (!this.ast || !this.ast.lexico) {
            this.agregarError("AST", "La estructura de Wison esta incompleta.", -1, -1);
            return;
        }

        for (let instruccion of this.ast.lexico) {
            if (instruccion.tipo === 'TERMINAL') {
                this.validarElementosRecursivo(instruccion.regla);
            }
        }
    }

    /*Metodo recursivo que permite encontrar recursivamente los macros o valores de ER invalidos*/
    validarElementosRecursivo(elementos) {

        for (let elemento of elementos) {
            const unidad = elemento.unidad;
            const modificadorActual = elemento.modificador;

            if (unidad.tipo === 'REFERENCIA_ID') {
                const idMacro = unidad.valor;
                const simboloReferenciado = this.tablaSimbolos.obtener(idMacro);

                if (!simboloReferenciado) {
                    this.agregarError(
                        idMacro,
                        `El macro '${idMacro}' no existe o no ha sido declarado previamente.`,
                        unidad.fila,
                        unidad.columna
                    );
                } else {
                    if (modificadorActual) {
                        const reglaOriginal = simboloReferenciado.regla;

                        if (reglaOriginal.length === 1 && reglaOriginal[0].modificador) {
                            this.agregarError(
                                idMacro,
                                `Conflicto: Estas aplicando '${modificadorActual}' al macro '${idMacro}', que ya contiene el modificador '${reglaOriginal[0].modificador}'. Esto genera una ER invalida.`,
                                unidad.fila,
                                unidad.columna
                            );
                        }
                    }
                }
            }
            else if (unidad.tipo === 'AGRUPACION') {
                this.validarElementosRecursivo(unidad.contenido);
            }
        }
    }


    /*Metodo que permite ejecutar la validacion del apartado sintactico de Wison */
    procesarParteSintactica() {

        if (!this.ast || !this.ast.sintactico) {
            this.agregarError("AST", "La estructura sintactica de Wison esta incompleta.", -1, -1);
            return;
        }

        const instrucciones = this.ast.sintactico;

        this.generarPrimeraPasada(instrucciones);

        this.generarSegundaPasada(instrucciones);

        this.generarTerceraPasada(instrucciones);
    }

    /*Primera pasada para extraer los no terminales creados */
    generarPrimeraPasada(instrucciones) {
        for (let instruccion of instrucciones) {
            if (instruccion.tipo === 'DECLARACION_NO_TERMINAL') {
                const idNoTerminal = instruccion.id;

                if (this.tablaSimbolos.existe(idNoTerminal)) {
                    const simboloExistente = this.tablaSimbolos.obtener(idNoTerminal);


                    const tipoExistente = simboloExistente.getTipo;
                    const lineaOriginal = simboloExistente.getLinea;

                    if (tipoExistente === TipoSimbolo.TERMINAL) {
                        this.agregarError(
                            idNoTerminal,
                            `El ID '${idNoTerminal}' ya fue definido como Terminal en la linea: ${lineaOriginal}. No puede ser un No_Terminal.`,
                            instruccion.fila,
                            instruccion.columna
                        );
                    } else if (tipoExistente === TipoSimbolo.NO_TERMINAL) {
                        this.agregarError(
                            idNoTerminal,
                            `El No_Terminal '${idNoTerminal}' ya se declaro anteriormente en la linea ${lineaOriginal}.`,
                            instruccion.fila,
                            instruccion.columna
                        );
                    }
                } else {
                    const nuevoSimbolo = new Simbolo(
                        idNoTerminal,
                        TipoSimbolo.NO_TERMINAL,
                        instruccion.fila,
                        instruccion.columna
                    );
                    this.tablaSimbolos.agregar(nuevoSimbolo);
                }
            }
        }
    }

    /*Segunda pasada para agregar los no terminales y verificar sus producciones creadas*/
    generarSegundaPasada(instrucciones) {

        let contadorSimboloInicial = 0;

        for (let instruccion of instrucciones) {

            /*Validar el simbolo inicial */
            if (instruccion.tipo === 'SIMBOLO_INICIAL') {
                contadorSimboloInicial++;
                const idInicial = instruccion.id;
                const simboloRef = this.tablaSimbolos.obtener(idInicial);

                if (!simboloRef || simboloRef.getTipo !== TipoSimbolo.NO_TERMINAL) {
                    this.agregarError(
                        idInicial,
                        `El simbolo inicial '${idInicial}' debe ser un No Terminal declarado.`,
                        instruccion.fila,
                        instruccion.columna
                    );
                } else {
                    this.tieneSimboloInicial = true;
                }
            }
            else if (instruccion.tipo === 'PRODUCCION') {

                const idPadre = instruccion.padre;

                const simPadre = this.tablaSimbolos.obtener(idPadre);

                if (!simPadre || simPadre.getTipo !== TipoSimbolo.NO_TERMINAL) {
                    this.agregarError(
                        idPadre,
                        `La produccion pertenece a '${idPadre}', pero no esta declarado como No_Terminal.`,
                        instruccion.fila,
                        instruccion.columna
                    );
                }

                //Validar las producciones
                for (let alternativa of instruccion.alternativas) {
                    for (let simboloHijo of alternativa) {

                        const idHijo = simboloHijo.valor;

                        /*Ignorar lambda */
                        if (simboloHijo.tipo === 'LAMBDA' || idHijo.toUpperCase() === 'LAMBDA') {
                            continue;
                        }

                        const existeHijo = this.tablaSimbolos.obtener(idHijo);

                        if (!existeHijo) {
                            this.agregarError(
                                idHijo,
                                `El simbolo '${idHijo}' no ha sido declarado ni como Terminal ni como No Terminal.`,
                                simboloHijo.fila,
                                simboloHijo.columna
                            );
                        }
                    }
                }
            }
        }

        if (contadorSimboloInicial === 0) {

            this.agregarError("Initial_Sim", "La gramatica no tiene un Simbolo Inicial definido.", -1, -1);
        } else if (contadorSimboloInicial > 1) {

            this.agregarError("Initial_Sim", "Se declaro mas de un Simbolo Inicial. Solo debe existir uno.", -1, -1);
        }
    }


    /*Tercera pasada: Esta permite ejecutar el metodo para calificar a los no terminales GENERADORES Y NO GENERADORES 
    *
    * Fuera del concepto amplio esta es una tecnica utilizada para detectar los bucles infinitos en las gramaticas
    * esto se implementa de tal forma que se va evaluando los caminos y si cada camino converge a un terminal. No tiene bucles
    * caso contrario si esta no llega a un terminal es ambigua ya que generara bucles infinitos.
    * 
    */

    generarTerceraPasada(instrucciones) {
        /*Generadores: No terminales que convergen a un lambda o terminal 
        * NO generadores: No terminales que no convergen a terminal*/
        const generadores = new Set();

        let huboCambios = true;

        /*Fase 1: identificar generadores */
        while (huboCambios) {
            huboCambios = false;

            for (let instruccion of instrucciones) {

                if (instruccion.tipo !== 'PRODUCCION') {
                    continue;
                }

                const padre = instruccion.padre;

                if (generadores.has(padre)) {
                    continue;
                }

                for (let alternativa of instruccion.alternativas) {

                    let alternativaGeneradora = true;

                    for (let simboloHijo of alternativa) {

                        /*Terminales y lambdas evitan bucles */
                        if (simboloHijo.tipo === 'TERMINAL' || simboloHijo.tipo === 'LAMBDA') {
                            continue;
                        }
                        else if (simboloHijo.tipo === 'NO_TERMINAL') {
                            /*Si es no terminal debe estar en el set */

                            if (!generadores.has(simboloHijo.valor)) {
                                alternativaGeneradora = false;
                                break;
                            }

                        }

                    }

                    /*Si se encontro una alternativa en donde los hijos generan (Llamados a terminales) */
                    if (alternativaGeneradora) {
                        generadores.add(padre);
                        huboCambios = true;
                        break;
                    }
                }
            }
        }

        //Fase 2: los que no entraron al set es porque no tienen 
        for (let instruccion of instrucciones) {

            if (instruccion.tipo === 'DECLARACION_NO_TERMINAL') {

                const idNoTerminal = instruccion.id;

                if (!generadores.has(idNoTerminal)) {

                    const tieneProduccion = instrucciones.some(i => i.tipo === 'PRODUCCION' && i.padre === idNoTerminal);


                    if (!tieneProduccion) {
                        this.erroresSemanticos.push({
                            lexema: idNoTerminal,
                            tipo: "Semantico",
                            fila: instruccion.fila,
                            columna: instruccion.columna,
                            descripcion: `El No Terminal '${idNoTerminal}' fue declarado pero no tiene ninguna regla de producción definida.`
                        });
                    } else {
                        this.erroresSemanticos.push({
                            lexema: idNoTerminal,
                            tipo: "Ambiguedad",
                            fila: instruccion.fila,
                            columna: instruccion.columna,
                            descripcion: `El No Terminal '${idNoTerminal}'. Crea un bucle infinito. Carece del caso base producir (Terminal o LAMBDA).`

                        });
                    }
                }
            }
        }

    }


    /*Metodo que permite agregar los errores a la lista */
    agregarError(lex, desc, fila, columna) {
        this.erroresSemanticos.push({
            lexema: lex,
            tipo: "Semantico",
            fila: fila,
            columna: columna,
            descripcion: desc

        });
    }

}