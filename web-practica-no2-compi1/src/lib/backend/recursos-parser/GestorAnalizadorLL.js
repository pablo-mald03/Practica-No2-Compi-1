/*Clase delegada para poder generar el analizador sintactico descendente (PATRON EXPERTO) */

export default class GestorAnalizadorLL {

    constructor(astGeneral, tablaGeneradaLL, tablaSimbolosGlobal) {
        /*Representacion de la tabla LL(1) */
        this.tablaLL1 = tablaGeneradaLL;
        this.astProcesado = astGeneral;
        this.tablaSimbolos = tablaSimbolosGlobal;
    }


    /*Metodo encargado de retornar el objeto para poder almacenar los strings generados del parser y lexer */
    generarAnalizadores(nombreRecibido) {

        const ahora = new Date();

        const MM = String(ahora.getMonth() + 1).padStart(2, '0');
        const DD = String(ahora.getDate()).padStart(2, '0');
        const mm = String(ahora.getMinutes()).padStart(2, '0');
        const ss = String(ahora.getSeconds()).padStart(2, '0');

        const timestamp = `${MM}_${DD}_${mm}_${ss}`;

        let base = (nombreRecibido || "Gramatica").trim().replace(/\s+/g, '_');

        let nombreFinal = `${base}_${timestamp}`;

        const lexerJisonGenerado = this.generarCodigoJison();

        const parserLLGenerado = this.generarCodigoParserJS(nombreFinal);

        return {
            nombreGenerado: nombreFinal,
            lexerGenerado: lexerJisonGenerado,
            parserGenerado: parserLLGenerado
        };

    }

    /*Metodo delegado para poder armar el .jison como ANALIZADOR LEXICO */
    generarCodigoJison() {

        let reglasLexicas = "";
        let mapeoTokens = "";

        let contador = 0;

        for (const terminal of this.astProcesado.lexico) {

            /*Parte lexica: Traduccion de TERMINALES A EXPRESIONES REGULARES */

            let idLimpio = terminal.id.replace(/^\$_/, '').toUpperCase();

            const regexConstruido = this.traducirReglaRegex(terminal.regla);

            reglasLexicas += `${regexConstruido}     return '${idLimpio}';\n`;

            /*Parte sintactica: Traduccion de NO TERMINALES reconocimiento de tokens*/
            if (contador !== 0) {
                mapeoTokens += `    | ${idLimpio}\n`;
            } else {
                mapeoTokens += `    : ${idLimpio}\n`;
            }

            mapeoTokens += `        {{ $$ = { tipo: '${idLimpio}', valor: yytext, fila: yylineno, columna: @1.first_column + 1 }; }}\n`;

            contador++;
        }

        /*Union de todo el archivo .jison */
        return `
%lex
%options ranges yylineno
%%
\\s+                   /* ignorar espacios */
[\\u200B\\uFEFF\\u200E\\u200F\\u202A-\\u202E]+      /* Ignorar caracteres basura */

${reglasLexicas}
<<EOF>>               return 'EOF';
.                     return 'ERROR_LEXICO';
/lex

%start recolector
%%
recolector
    : lista_tokens EOF {{ $1.push({ tipo: 'EOF', valor: 'EOF', fila: yylineno, columna: 0 }); return $1; }}
    | EOF {{ return [{ tipo: 'EOF', valor: 'EOF', fila: yylineno, columna: 0 }]; }}
    ;

lista_tokens
    : lista_tokens token {{ $1.push($2); $$ = $1; }}
    | token {{ $$ = [$1]; }}
    ;

token
${mapeoTokens.substring(4)} 
    | ERROR_LEXICO
        {{ $$ = { tipo: 'ERROR_LEXICO', valor: yytext, fila: yylineno, columna: @1.first_column + 1 }; }}
    ;
`;
    }


    /*Metodo auxiliar que permite retornar las ER generadas por los terminales */
    traducirReglaRegex(reglaTerminal) {
        let regexResultante = "";

        for (const elemento of reglaTerminal) {
            let fragmento = "";

            const unidad = elemento.unidad;
            const modificador = elemento.modificador;

            switch (unidad.tipo) {
                case 'CADENA':
                    fragmento = `"${unidad.valor}"`;
                    break;

                case 'RANGO':
                    fragmento = unidad.valor;
                    break;

                case 'AGRUPACION':
                    const contenidoInterno = this.traducirReglaRegex(unidad.contenido);
                    fragmento = `(${contenidoInterno})`;
                    break;

                case 'REFERENCIA_ID':
                    fragmento = this.resolverReferenciaLexica(unidad.valor);
                    break;

                default:
                    fragmento = unidad.valor;
            }

            if (modificador) {
                fragmento += modificador;
            }

            regexResultante += fragmento;
        }

        return regexResultante;
    }

    /*Metodo que permite tomar la referencia del ID */
    resolverReferenciaLexica(idReferencia) {

        const simboloRef = this.tablaSimbolos.obtener(idReferencia);

        if (!simboloRef) {
            return "";
        }

        const reglaDelTerminal = simboloRef.getRegla;

        return this.traducirReglaRegex(reglaDelTerminal);
    }


    /*Metodo auxiliar que permite retornar el simbolo inicial */
    obtenerNombreInicial() {
        const bloqueSintactico = this.astProcesado.sintactico;

        let idSimboloInicial = null;

        /*Primera regla: SE LE AGREGA EL FIN DE CADENA (SIGUIENDO LO MISMO QUE LOS LALR LE PUSE EOF) */
        for (const instruccion of bloqueSintactico) {

            if (instruccion.tipo === 'SIMBOLO_INICIAL') {
                idSimboloInicial = instruccion.id;
                break;
            }
        }

        return {
            simboloInicial: idSimboloInicial
        };
    }


    /*Metodo delegado para poder armar el .js como ANALIZADOR SINTACTICO DESCENDENTE */
    generarCodigoParserJS(nombreClase) {

        /*Funciones recursivas generadas por el analizador sintactico*/
        let metodosRecursivos = "";

        /*Se generaran las funciones iterando sobre la tabla*/
        for (const [noTerminal, transiciones] of this.tablaLL1.entries()) {

            metodosRecursivos += `\n    /*Metodo recursivo generado para el No terminal: ${noTerminal}*/\n`;
            metodosRecursivos += `  terminalL_${noTerminal}(){\n`;
            metodosRecursivos += `      /*Nodo de derivacion (visual) para la derivacion*/\n`;
            metodosRecursivos += `      let nodo = { id: this.generarId(), label: "${noTerminal}", children: [] };\n`;
            metodosRecursivos += `      let tokenActual = this.obtenerToken();\n\n`;
            metodosRecursivos += `          switch(tokenActual.tipo) {\n`;

            /*Se agrupan las tansiciones para generar cada caso del switch */
            for (const [terminal, alternativa] of transiciones.entries()) {

                metodosRecursivos += `              case '${terminal}': \n`;

                /*Se generan las transiciones segun las alternativas de transicion */
                for (const simbolo of alternativa) {

                    if (simbolo.tipo === 'TERMINAL') {
                        metodosRecursivos += `                  nodo.children.push(this.consumir('${simbolo.valor}'));\n`;
                    } 
                    else if (simbolo.tipo === 'NO_TERMINAL') {
                        metodosRecursivos += `                  nodo.children.push(this.terminalL_${simbolo.valor}());\n`;
                    } 
                    else if (simbolo.tipo === 'LAMBDA') {
                        metodosRecursivos += `                  nodo.children.push({ id: this.generarId(), label: "LAMBDA", children: [] });\n`;
                    }
                }
                metodosRecursivos += `                  break;\n`;
            }

            metodosRecursivos += `              default:\n`;
            metodosRecursivos += `                  this.errores.push({lexema: \`'\${tokenActual.valor}'\`,tipo: 'Sintactico', mensaje: \`Error sintactico en ${noTerminal}: Token inesperado '\${tokenActual.tipo}'\`, fila: tokenActual.fila, columna: tokenActual.columna });\n`;
            metodosRecursivos += `                  //Produccion de error para la produccion\n`;
            metodosRecursivos += `                  nodo.children.push({ id: this.generarId(), label: "ERROR", children: [] });\n`;
            metodosRecursivos += `                  break;\n`;
            metodosRecursivos += `          }\n`;

            metodosRecursivos += `          return nodo;\n`;
            metodosRecursivos += `      }\n`;
        }

        /*Simbolo inicial de la gramatica */
        const { simboloInicial } = this.obtenerNombreInicial();


        return `
class Parser_${nombreClase} {

    constructor(){
        this.tokens = [];
        this.indice = 0;
        this.errores = [];
        this.contadorId = 0;
    }

    /*Metodo principal que permite ejecutar el analisis de la cadena de entrada*/
    /*--los tokens recibidos son los retornados por el lexer--*/
    parse(tokensEntrada){
        this.tokens = tokensEntrada;
        this.indice = 0;
        this.errores = [];
        this.contadorId = 0;

        /*--Inicio del analisis sintactico--*/
        let raiz = this.terminalL_${simboloInicial}();
        let tokenFinal = this.obtenerToken();
        
        if (tokenFinal.tipo !== 'EOF') {
            this.errores.push({lexema: 'EOF', tipo: 'Sintactico', mensaje: \`Se esperaba EOF, pero se encontro \${tokenFinal.tipo}\`, fila: tokenFinal.fila, columna: tokenFinal.columna });
        }
        
        return {
            arbol: raiz,
            errores: this.errores
        };
    }

    /*Metodo utilizado para poder generar los ID unicos para poder graficar*/
    generarId(){
        return "n_" + (this.contadorId++);
    }

    /*Metodo utilizado para poder obtener los tokens generados (Los que vienen del lexer)*/
    obtenerToken(){
        if(this.indice < this.tokens.length){
            return this.tokens[this.indice];
        }
        /*--Caso de no encontrar el token (Error lexico)--*/
        return { 
                tipo: 'EOF', 
                valor: 'EOF', 
                fila: -1, 
                columna: -1 
        };
    }

    /*--Funcion que permite generar el avance de una produccion--*/
    consumir(tokenEsperado){
    
        let tokenActual = this.obtenerToken();
        
        if(tokenActual.tipo === tokenEsperado){ 
            this.indice++;
            return { id: this.generarId(), label: \`'\${tokenActual.valor}'\`, children: [] };
        } else {
            this.errores.push({lexema: tokenActual.valor, tipo: 'Sintactico', mensaje: \`Se esperaba \${tokenEsperado} pero vino: \${tokenActual.tipo}\`, fila: tokenActual.fila, columna: tokenActual.columna });
            return { id: this.generarId(), label: "ERROR", children: [] };
        }
    }

${metodosRecursivos}
} 

/*Se genera la exportacion del parser generado*/
export default Parser_${nombreClase};`;
    }
}

/*Created by Pablo */