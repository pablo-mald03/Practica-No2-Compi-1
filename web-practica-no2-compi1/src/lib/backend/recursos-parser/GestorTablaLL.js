/*Imports de la clase */

/*Clase delegada para poder gestionar toda la logica de la generacion de la tabla LL(1) */
export default class GestorTablaLL {

    constructor(ast, tablaSimbolosGlobal) {
        this.ast = ast;
        this.erroresColisiones = [];
        this.tablaSimbolos = tablaSimbolosGlobal;

        /*Apartado de generacion de primeros y siguientes */
        this.primeros = new Map();
        this.siguientes = new Map();

        this.tablaLL = null;
    }

    /*Metodo delegado para poder procesar y generar los mecanismos para armar la tabla LL(1) */
    procesarTablaLL() {

        this.normalizarAST();

        this.inicializadConjuntos();

        this.calcularPrimeros();

        this.calcularSiguientes();

        this.construirTablaLL1();

        return {
            erroresAmbiguedad: this.erroresColisiones,
            tabla: this.tablaLL
        };
    }

    /*Metodo auxiliar que permite calcular los primeros de una secuencia. Las producciones diferentes que tiene un mismo no terminal*/
    obtenerPrimerosAlternativa(alternativa) {
        const primerosSecuencia = new Set();
        let todoEsLambda = true;

        for (const simbolo of alternativa) {

            if (simbolo.tipo === 'TERMINAL' || simbolo.tipo === 'LAMBDA') {
                primerosSecuencia.add(simbolo.valor);
                todoEsLambda = false;
                break;
            }
            else if (simbolo.tipo === 'NO_TERMINAL') {

                const primerosHijo = this.primeros.get(simbolo.valor) || new Set();
                let hijoTieneLambda = false;

                for (const token of primerosHijo) {
                    if (token === 'LAMBDA') {
                        hijoTieneLambda = true;
                    } else {
                        primerosSecuencia.add(token);
                    }
                }

                if (!hijoTieneLambda) {
                    todoEsLambda = false;
                    break;
                }
            }
        }

        if (todoEsLambda) {
            primerosSecuencia.add('LAMBDA');
        }

        return primerosSecuencia;
    }

    /*Metodo delegado para poder armar la tabla LL(1) e identificar las colisiones que hay*/
    construirTablaLL1() {

        this.tablaLL = new Map();

        const bloqueSintactico = this.ast.sintactico;

        if (!bloqueSintactico) {
            return;
        }

        for (const instruccion of bloqueSintactico) {

            if (instruccion.tipo !== 'PRODUCCION') {
                continue;
            }

            const noTerminal = instruccion.padre;


            /*Se inicializa la fila del no terminal */
            if (!this.tablaLL.has(noTerminal)) {
                this.tablaLL.set(noTerminal, new Map());
            }


            const filaTabla = this.tablaLL.get(noTerminal);


            for (const alternativa of instruccion.alternativas) {


                //Se obtienen los primeros de cada alternativa
                const primerosAlternativa = this.obtenerPrimerosAlternativa(alternativa);


                /*Regla 1: POR CADA TERMINAL EN LOS PRIMEROS SE ASIGNAN LAS ALTERNATIVAS */
                for (const terminal of primerosAlternativa) {

                    if (terminal !== 'LAMBDA') {
                        this.insertarEnTabla(filaTabla, noTerminal, terminal, alternativa, instruccion.fila, instruccion.columna);
                    }
                }

                /*Regla 2: SI LA ALTERNATIVA DERIVA EN LAMBDA, SE USAN LOS SIGUIENTES DE LA PRODUCCION */
                if (primerosAlternativa.has('LAMBDA')) {

                    const siguientesPadre = this.siguientes.get(noTerminal) || new Set();

                    for (const terminalSiguiente of siguientesPadre) {
                        this.insertarEnTabla(filaTabla, noTerminal, terminalSiguiente, alternativa, instruccion.fila, instruccion.columna);
                    }
                }

            }

        }

    }


    /*Metodo auxiliar que permite insertar en tabla y detectar las colisiones */
    insertarEnTabla(filaTabla, noTerminal, terminal, alternativaNueva, fila, columna) {

        if (filaTabla.has(terminal)) {

            const alternativaPrevia = filaTabla.get(terminal);
            let tipoError = "Ambiguedad en gramatica";


            //Se verifica si alguna de las dos alternativas inicia con el mismo no terminal

            const esRecursivaNueva = alternativaNueva.length > 0 && alternativaNueva[0].valor === noTerminal;
            const esRecursivaPrevia = alternativaPrevia.length > 0 && alternativaPrevia[0].valor === noTerminal;

            if (esRecursivaNueva || esRecursivaPrevia) {
                tipoError = "Recursividad por la izquierda directa detectada";
            }
            else if (alternativaNueva.length > 0 && alternativaPrevia.length > 0 &&
                alternativaNueva[0].valor === alternativaPrevia[0].valor) {

                /*Falta de factorizacion a la izquierda */

                tipoError = `Falta de factorizacion por la izquierda. Ambas alternativas inician con '${alternativaNueva[0].valor}'`;
            }
            else if (alternativaNueva.some(s => s.tipo === 'LAMBDA') || alternativaPrevia.some(s => s.tipo === 'LAMBDA')) {
                /*Alguien es lambda */
                tipoError = "Conflicto Primero/Siguiente una alternativa se anula con LAMBDA.";
            }
            else {
                tipoError = "Conflicto Primero/Primero interseccion de conjuntos";
            }

            this.agregarError(
                terminal,
                `${tipoError} con las producciones: [${noTerminal}, ${terminal}].`,
                fila,
                columna
            );
        } else {
            /*Se guarda la alternativa */
            filaTabla.set(terminal, alternativaNueva);
        }
    }


    /*Metodo delegado para poder inicializar los primeros de las reglas de producion */
    inicializadConjuntos() {

        const bloqueSintactico = this.ast.sintactico;

        if (!bloqueSintactico) {
            this.agregarError("Estructura", "La estructura de Wison esta incompleta. Parte sintactica faltante.", -1, -1);
            return;
        }

        for (const instruccion of bloqueSintactico) {

            if (instruccion.tipo === 'PRODUCCION') {
                if (!this.primeros.has(instruccion.padre)) {
                    this.primeros.set(instruccion.padre, new Set());
                    this.siguientes.set(instruccion.padre, new Set());
                }
            }
        }

    }

    /*Metodo delegado para poder calcular los primeros de las producciones*/
    calcularPrimeros() {

        const bloqueSintactico = this.ast.sintactico;
        if (!bloqueSintactico) {
            this.agregarError("Estructura", "La estructura de Wison esta incompleta. Parte sintactica faltante.", -1, -1);
            return;
        }

        let huboCambios = true;

        while (huboCambios) {

            huboCambios = false;

            for (const instruccion of bloqueSintactico) {

                if (instruccion.tipo != 'PRODUCCION') {
                    continue;
                }

                const noTerminal = instruccion.padre;
                const setActual = this.primeros.get(noTerminal);
                const longitudAntes = setActual.size;

                /*Se evalua cada una de las alternativas de produccion */
                for (const alternativa of instruccion.alternativas) {

                    let todosPuedenSerLambda = true;

                    for (const simbolo of alternativa) {

                        /*Caso primera regla: SI UN TERMINAL ESTA A LA DERECHA DE PRIMERO ES EL PROPIO PRIMERO */
                        if (simbolo.tipo === 'TERMINAL' || simbolo.tipo === 'LAMBDA') {
                            setActual.add(simbolo.valor);
                            todosPuedenSerLambda = false;
                            break;
                        }
                        else if (simbolo.tipo === 'NO_TERMINAL') {

                            /*Caso segunda regla: SI ES UN NO TERMINAL QUE APARECE DE PRIMERO SE BUSCA EN LAS DEMAS REGLAS DE PRODUCCION*/
                            const primerosHijo = this.primeros.get(simbolo.valor) || new Set();
                            let hijoTieneLambda = false;

                            /*REGLA: se agregan todos los primeros del hijo al padre (PADRE = NO TERMINAL IZQUIERDA) */
                            for (const token of primerosHijo) {
                                if (token === 'LAMBDA') {
                                    hijoTieneLambda = true;
                                } else {
                                    setActual.add(token);
                                }
                            }

                            if (!hijoTieneLambda) {
                                todosPuedenSerLambda = false;
                                break;
                            }

                        }

                    }

                    if (todosPuedenSerLambda) {
                        setActual.add('LAMBDA');
                    }

                }

                if (setActual.size > longitudAntes) {
                    huboCambios = true;
                }
            }
        }
    }

    /*Metodo delegado para poder calcular los siguientes de las producciones*/
    calcularSiguientes() {

        const bloqueSintactico = this.ast.sintactico;

        if (!bloqueSintactico) {
            this.agregarError("Estructura", "La estructura de Wison esta incompleta. Parte sintactica faltante.", -1, -1);
            return;
        }

        let idSimboloInicial = null;

        /*Primera regla: SE LE AGREGA EL FIN DE CADENA (SIGUIENDO LO MISMO QUE LOS LALR LE PUSE EOF) */
        for (const instruccion of bloqueSintactico) {

            if (instruccion.tipo === 'SIMBOLO_INICIAL') {
                idSimboloInicial = instruccion.id;
                break;
            }
        }

        if (idSimboloInicial && this.siguientes.has(idSimboloInicial)) {
            this.siguientes.get(idSimboloInicial).add('EOF');
        }

        /*Segunda regla: BUSCAR LOS NO TERMINALES QUE APAREZCAN CON TRANISCIONES LAMBDAS O A LA DERECHA DE LAS PRODUCCIONES */

        let huboCambios = true;

        while (huboCambios) {

            huboCambios = false;

            for (const instruccion of bloqueSintactico) {

                if (instruccion.tipo !== 'PRODUCCION') {
                    continue;
                }

                const padre = instruccion.padre;

                for (const alternativa of instruccion.alternativas) {


                    for (let i = 0; i < alternativa.length; i++) {

                        const simboloActual = alternativa[i];


                        if (simboloActual.tipo !== 'NO_TERMINAL') {
                            continue;
                        }

                        const setSiguienteHijo = this.siguientes.get(simboloActual.valor);
                        if (!setSiguienteHijo) {
                            continue;
                        }

                        const longitudAntes = setSiguienteHijo.size;
                        let todoLoQueSigueEsLambda = true;

                        for (let j = i + 1; j < alternativa.length; j++) {

                            const simboloAdelante = alternativa[j];

                            /*Regla base: EL SIGUIENTE DE UN TERMINAL ES EL MISMO TERMINAL */
                            if (simboloAdelante.tipo === 'TERMINAL') {
                                setSiguienteHijo.add(simboloAdelante.valor);
                                todoLoQueSigueEsLambda = false;
                                break;
                            }
                            else if (simboloAdelante.tipo === 'NO_TERMINAL') {

                                /*Regla comun: SI EL SIGUIENTE ES UN NO TERMINAL SE AGREGAN LOS PRIMEROS DE ESE NO TERMINAL */
                                const primerosAdelante = this.primeros.get(simboloAdelante.valor) || new Set();
                                let adelanteTieneLambda = false;

                                for (const token of primerosAdelante) {
                                    if (token === 'LAMBDA') {
                                        adelanteTieneLambda = true;
                                    } else {
                                        setSiguienteHijo.add(token);
                                    }
                                }

                                /*Regla Lambda: SI ESTE TERMINAL PUEDE LLEGAR A SER LAMBDA SE SIGUE BUSCA EL CASO EN DONDE SE HACE LAMBDA Y SE LLEGA AL SIGUIENTE */
                                if (!adelanteTieneLambda) {
                                    todoLoQueSigueEsLambda = false;
                                    break;
                                }

                            }

                        }

                        //Regla 3: SI EL TERMINAL ESTA DE ULTIMO DEL LADO IZQUIERDO O SI TODO DESPUES EL LAMBDA 
                        if (todoLoQueSigueEsLambda) {
                            const siguientesDelPadre = this.siguientes.get(padre) || new Set();
                            for (const token of siguientesDelPadre) {
                                setSiguienteHijo.add(token);
                            }
                        }

                        /*VERIFICACION SI SE LOGRO INYECTAR ALGO EN EL SET*/
                        if (setSiguienteHijo.size > longitudAntes) {
                            huboCambios = true;
                        }
                    }
                }
            }
        }
    }


    /*Metodo que permite limpiar los identificadores de los terminales y no terminales */
    limpiarSimbolo(id) {
        if (!id) {
            return id;
        }

        return id.replace(/^[$%]_/, '');
    }

    /*Metodo delegado para poder normalizar a los TERMINALES Y NO TERMINALES. Esto con el fin de evitar los caracteres especiales de JS */
    normalizarAST() {
        const sintactico = this.ast.sintactico;

        if (!sintactico) return;

        for (const instruccion of sintactico) {

            if (instruccion.tipo === 'DECLARACION_NO_TERMINAL' || instruccion.tipo === 'SIMBOLO_INICIAL') {
                instruccion.id = this.limpiarSimbolo(instruccion.id);
            }

            if (instruccion.tipo === 'PRODUCCION') {
                instruccion.padre = this.limpiarSimbolo(instruccion.padre);

                for (const alternativa of instruccion.alternativas) {
                    for (const simbolo of alternativa) {
                        if (simbolo.tipo === 'TERMINAL' || simbolo.tipo === 'NO_TERMINAL') {
                            simbolo.valor = this.limpiarSimbolo(simbolo.valor);
                        }
                    }
                }
            }
        }
    }


    /*Metodo que permite agregar los errores a la lista */
    agregarError(lex, desc, fila, columna) {
        this.erroresColisiones.push({
            lexema: lex,
            tipo: "Ambiguedad",
            fila: fila,
            columna: columna,
            descripcion: desc

        });
    }

}