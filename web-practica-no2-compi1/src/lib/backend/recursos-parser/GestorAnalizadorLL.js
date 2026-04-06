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
        for (const terminal of this.astProcesado.lexico) {

            /*Parte lexica: Traduccion de TERMINALES A EXPRESIONES REGULARES */

            let idLimpio = terminal.id.replace(/^\$_/, '').toUpperCase();

            const regexConstruido = this.traducirReglaRegex(terminal.regla);

            reglasLexicas += `${regexConstruido}     return '${idLimpio}';\n`;

            /*Parte sintactica: Traduccion de NO TERMINALES reconocimiento de tokens*/
            mapeoTokens += `    | ${idLimpio}\n`;
            mapeoTokens += `        {{ $$ = { tipo: '${idLimpio}', valor: yytext, fila: yylineno, columna: @1.first_column + 1 }; }}\n`;

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
                    this.agregarError("Generación Jison", `Tipo de unidad lexica desconocido: ${unidad.tipo}`, unidad.fila, unidad.columna);
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


    /*Metodo delegado para poder armar el .js como ANALIZADOR SINTACTICO DESCENDENTE */
    generarCodigoParserJS(nombreClase) {


        return "";
    }

}

/*Created by Pablo */