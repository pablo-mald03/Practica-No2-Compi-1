/* Seccion analizador Lexico */
%lex
%options ranges yylineno
%%
/*Espacios y saltos de linea*/

\s+                   /* ignorar espacios */

[\u200B\uFEFF\u200E\u200F\u202A-\u202E]+ /* Ignorar caracteres basura */

/*Apartado de comentarios*/

"#".*           /*Ignorar comentario de linea*/

"/**"([^*]|\*+[^*/])*(\*+"/")           /*Ignorar comentario multilinea*/ 


/*---*******------Expresiones regulares reglas lexicas aceptadas en el lenguaje------*******---*/

"[0-9]"                     return 'RANGO_NUMERO';

"[a-z]"                     return 'RANGO_MINUSCULA';

"[A-Z]"                     return 'RANGO_MAYUSCULA';

"[aA-zZ]"                     return 'RANGO_TOTAL';


/*---*******------Palabras reservadas del lenguaje------*******---*/

"Wison"                         return 'WISON';

"Lex"                           return 'LEX';

"Terminal"                      return 'TERMINAL';

"No_Terminal"                   return 'NO_TERMINAL';

"Syntax"                        return 'SYNTAX_PARSER';

"Initial_Sim"                   return 'SIMBOLO_INICIAL';



/*---*******------Caracteres especiales del lenguaje------*******---*/

"("                         return 'PARENT_APERTURA';

")"                         return 'PARENT_CIERRE';

"{"                         return 'LLAVE_APERTURA';

"}"                         return 'LLAVE_CIERRE';

"["                         return 'CORCHETE_APERTURA';

"]"                         return 'CORCHETE_CIERRE';

":"                         return 'DOS_PUNTOS';

"<"                         return 'MENOR';

";"                         return 'PUNTO_COMA';

"|"                         return 'OR_EXP';


/*---*******------Caracteres que permiten usar expresiones regulares en el lenguaje wison------*******---*/

"-"                         return 'MENOS';

"+"                         return 'MAS';

"*"                         return 'KLEENE';

"¿"                         return 'QUEST_APERTURA';

"?"                         return 'QUEST_CIERRE';

"$_"[a-zA-Z0-9_]+           return 'ID_TERMINAL';

"%_"[a-zA-Z0-9_]+           return 'ID_NO_TERMINAL';

"'"[^']*"'"             { 
                        yytext = yytext.slice(1, -1); 
                        return 'LITERAL_CADENA'; 
                        }



/*---*******------Caracteres que permiten generar producciones en el analizador sintactico------*******---*/

"="                         return 'IGUAL';

.                           {
                                if (!yy.errores) yy.errores = [];
                                
                                yy.errores.push({
                                    lexema: yytext,
                                    tipo: "Lexico",
                                    fila: yylloc.first_line,
                                    columna: yylloc.first_column + 1,
                                    descripcion: "Caracter no valido en el lenguaje"
                                });
                            }

<<EOF>>                     return 'EOF';

/lex


/*---****===== Seccion del analizador Sintactico =====****---*/

%{
    /* Diccionario para traducir tokens técnicos a nombres amigables */
    const diccionarioTokens = {
        "PUNTO_COMA": "';'",
        "LLAVE_APERTURA": "'{'",
        "LLAVE_CIERRE": "'}'",
        "CORCHETE_APERTURA": "'['",
        "CORCHETE_CIERRE": "']'",
        "QUEST_APERTURA": "'¿'",
        "QUEST_CIERRE": "'?'",
        "SYNTAX_PARSER": "la seccion 'Syntax'",
        "DOS_PUNTOS": "':'",
        "ID_TERMINAL": "identificador de terminal",
        "ID_NO_TERMINAL": "identificador de no terminal",
        "LEX": "la palabra reservada 'Lex'",
        "SYNTAX_PARSER": "la seccion 'Syntax'",
        "EOF": "el fin del archivo"
    };

    /* Función auxiliar para reportar errores al arreglo global */
    function reportarError(yy, info) {
        const nuevoError = {
            tipo: 'ERROR_SINTACTICO',
            descripcion: info.descripcion,
            fila: info.loc.first_line,
            columna: info.loc.first_column + 1
        };
    
        yy.errores.push({
            lexema: info.texto || "N/A",
            tipo: "Sintactico",
            fila: nuevoError.fila,
            columna: nuevoError.columna,
            descripcion: nuevoError.descripcion
        });
    
        return nuevoError;
    } 

    /* Función auxiliar para traducir los tokens esperados que Jison provee */
    function traducirEsperados(esperados) {

        if (!esperados || esperados.length === 0) return "algo diferente";

        const traducidos = esperados.map(token => {
            const tokenLimpio = token.replace(/'/g, "");
            return diccionarioTokens[tokenLimpio] || tokenLimpio;
        });

        if (traducidos.length > 1) {
            const ultimo = traducidos.pop();
            return traducidos.join(", ") + " o " + ultimo;
        }
        return traducidos[0];
    }
%}


/*----Simbolo inicial----*/

%start inicio

%%

/*-----=====-----Produccion principal de inicio-----=====-----*/

inicio  : WISON QUEST_APERTURA cuerpo  QUEST_CIERRE WISON  EOF 
        { 
            return $3; 
        }
        | error EOF 
        {
            reportarError(yy, {
                descripcion: 'Error fatal en la estructura principal del archivo Wison. Revisa las etiquetas WISON ? ... ? WISON.',
                loc: @1,
                texto: yytext
            });

            return null; 
        }
        ;

/*-----=====-----Produccion del cuerpo general de Wison-----=====-----*/

cuerpo      : bloque_lexico bloque_sintactico
            {{
                $$ = {
                    lexico: $1,
                    sintactico: $2
                };
            }}
            ;


/*-----=====-----Produccion para el bloque lexico-----=====-----*/

bloque_lexico   : LEX LLAVE_APERTURA DOS_PUNTOS estructura_lexica DOS_PUNTOS LLAVE_CIERRE
                {{
                    $$ = $4;
                }}
                | error LLAVE_CIERRE
                {{
                    reportarError(yy, {
                        descripcion: 'Error en la seccion Lex. Se esperaba una estructura correcta (Lex {:  ...  :}).',
                        loc: @1,
                        texto: yytext
                    });

                    $$ = null; 
                }}
                ;


/*-----=====-----Produccion para el bloque sintactico-----=====-----*/

bloque_sintactico   : SYNTAX_PARSER LLAVE_APERTURA LLAVE_APERTURA DOS_PUNTOS estructura_sintactica DOS_PUNTOS LLAVE_CIERRE LLAVE_CIERRE
                    {{
                        $$ = $5;
                    }}
                    | error LLAVE_CIERRE LLAVE_CIERRE
                    {{
                        reportarError(yy, {
                            descripcion: 'Error en la seccion Syntax. Se esperaba la estructura correcta (Syntax {{:  ...  :}' + '}).',
                            loc: @1,
                            texto: yytext
                        });

                        $$ = null; 
                    }}
                    ;



/*-----=====-----Produccion que define a la estructura lexica-----=====-----*/

estructura_lexica 
                : estructura_lexica produccion_terminal
                {{
                    $1.push($2);
                    $$  = $1;
                }}
                | produccion_terminal
                {{
                    $$ = [$1];
                }}
                ;


/*-----=====-----Producciones individuales del apartado lexico-----=====-----*/

produccion_terminal : TERMINAL ID_TERMINAL  MENOR MENOS regla_lexica PUNTO_COMA
                    {{

                        $$ = {
                            tipo: 'TERMINAL',
                            id: $2,
                            regla: $5,
                            fila: @2.first_line,    
                            columna: @2.first_column + 1
                        }

                    }}
                    | TERMINAL ID_TERMINAL  MENOR MENOS  regla_lexica
                    {{
                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion terminal. Se esperaba: punto y coma.',
                            loc: @5, 
                            texto: $1 + " " + $2
                        });

                    }}
                    | TERMINAL ID_TERMINAL  MENOR MENOS  PUNTO_COMA
                    {{
                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion terminal. Se esperaba: una expresion regular.',
                            loc: @4, 
                            texto: $1 + " " + $2 + " " + $3 + " " + $4
                        });

                    }}
                    | TERMINAL ID_TERMINAL
                    {{
                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion terminal. Se esperaba: la expresion <-.',
                            loc: @2, 
                            texto: $1 + " " + $2
                        });

                    }}
                    | TERMINAL
                    {{
                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion terminal. Se esperaba: el nombre del terminal.',
                            loc: @1, 
                            texto: $1
                        });

                    }}
                    | error PUNTO_COMA
                    {{

                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion terminal. Estructura invalida antes del punto y coma.',
                            loc: @1,
                            texto: yytext
                        });
                    }}
                    ;

/*-----=====-----Producciones individuales del apartado lexico-----=====-----*/

regla_lexica    : regla_lexica elemento_lexico
                {{
                    $1.push($2);
                    $$ = $1;
                }}
                | elemento_lexico
                {{
                    $$ = [$1];
                }}
                ;


/*-----=====-----Producciones para elementos lexicos principales definidos en la seccion del lexer-----=====-----*/

elemento_lexico : unidad_lexica modificador
                {{
                    $$ = {
                        unidad: $1, 
                        modificador: $2
                    };
                }}
                | unidad_lexica 
                {{
                    $$ ={
                        unidad: $1, 
                        modificador: null
                    };
                }}
                ;

/*-----=====-----Producciones para las reglas de operadores unarios permitidos-----=====-----*/

modificador : KLEENE 
            {
                $$ = '*';
            }
            | MAS
            {
                $$ = '+';
            }
            | QUEST_CIERRE
            {
                $$ = '?';
            }
            ;


/*-----=====-----Producciones para las expresiones regulares permitidas-----=====-----*/

unidad_lexica   : LITERAL_CADENA
                {{
                    $$ = {
                        tipo: 'CADENA',
                        valor: $1,
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                | PARENT_APERTURA regla_lexica PARENT_CIERRE
                {{
                    $$ = {
                        tipo: 'AGRUPACION',
                        contenido: $2,
                        fila: @2.first_line,   
                        columna: @2.first_column + 1
                    };
                }}
                | ID_TERMINAL 
                {{
                    $$ = { 
                        tipo: 'REFERENCIA_ID', 
                        valor: $1,
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                | RANGO_NUMERO 
                {{
                    $$ = { 
                        tipo: 'RANGO', 
                        valor: '[0-9]',
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                | RANGO_MINUSCULA
                {{
                    $$ = { 
                        tipo: 'RANGO', 
                        valor: '[a-z]',
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                | RANGO_MAYUSCULA
                {{
                    $$ = { 
                        tipo: 'RANGO', 
                        valor: '[A-Z]',
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                | RANGO_TOTAL
                {{
                    $$ = { 
                        tipo: 'RANGO', 
                        valor: '[a-zA-Z]',
                        fila: @1.first_line,   
                        columna: @1.first_column + 1
                    };
                }}
                ;


/*-----=====-----Producciones para las transiciones del Analizador Sintactico-----=====-----*/

estructura_sintactica       : lista_instrucciones_sintacticas
                            {
                                $$ = $1;
                            }
                            ;

/*-----=====-----Producciones para la lista de transiciones del analizador sintactico-----=====-----*/

lista_instrucciones_sintacticas     : lista_instrucciones_sintacticas instruccion_sintactica
                                    {{
                                        $1.push($2); 
                                        $$ = $1;
                                    }} 
                                    | instruccion_sintactica
                                    {{
                                        $$ = [$1];
                                    }}
                                    ;

/*-----=====-----Producciones que definen a las instrucciones sintacticas que hay-----=====-----*/

instruccion_sintactica : non_terminales
                    {{
                        $$ = $1;
                    }}
                    | sim_inicial 
                    {{
                        $$ = $1;
                    }}
                    | regla_produccion
                    {{
                        $$ = $1;
                    }}
                    | error PUNTO_COMA
                    {{
                        $$ = reportarError(yy, {
                            descripcion: 'Error declaracion sintactica. Estructura invalida antes del punto y coma.',
                            loc: @1,
                            texto: yytext
                        });
                    }}
                    ;


/*-----=====-----Produccion de la estructura de los no terminales-----=====-----*/

non_terminales      : NO_TERMINAL ID_NO_TERMINAL PUNTO_COMA
                    {{
                        $$ = { 
                            tipo: 'DECLARACION_NO_TERMINAL', 
                            id: $2,
                            fila: @2.first_line,   
                            columna: @2.first_column + 1
                        };
                    }}
                    ;


/*-----=====-----Produccion del simbolo inicial de la gramatica-----=====-----*/

sim_inicial         : SIMBOLO_INICIAL ID_NO_TERMINAL PUNTO_COMA
                    {{
                        $$ = { 
                            tipo: 'SIMBOLO_INICIAL', 
                            id: $2,
                            fila: @2.first_line,   
                            columna: @2.first_column + 1
                        };
                    }}
                    ;


/*-----=====-----Produccion que define a la declaracion de las reglas de producion de la gramatica-----=====-----*/

regla_produccion    : ID_NO_TERMINAL MENOR IGUAL lista_alternativas PUNTO_COMA
                    {{
                        $$ = {
                            tipo: 'PRODUCCION',
                            padre: $1,
                            alternativas: $4,
                            fila: @1.first_line,   
                            columna: @1.first_column + 1
                        };
                    }}
                    ;


/*-----=====-----Produccion que define a la declaracion de las alternativas de la produccion o del no terminal-----=====-----*/

lista_alternativas  : lista_alternativas OR_EXP cuerpo_produccion
                    {{
                        $1.push($3);
                        $$ = $1;
                    }}
                    | cuerpo_produccion
                    {{
                        $$ = [$1];
                    }}
                    ;

/*-----=====-----Produccion que define al cuerpo de las producciones de Wison-----=====-----*/

cuerpo_produccion : lista_simbolos
                    {{
                        $$ = $1;
                    }}
                    | /*Produccion vacia*/
                    {{
                        $$ = [{
                            tipo: 'LAMBDA',
                            valor: 'LAMBDA',
                            fila: yylineno + 1, 
                            columna: yyleng + 1
                        }];
                    }}
                    ;


/*-----=====-----Produccion que define al listado de producciones dentro  de Wison-----=====-----*/
lista_simbolos      : lista_simbolos simbolo 
                    {{
                        $1.push($2); 
                        $$ = $1; 
                    }}
                    | simbolo 
                    {{ 
                        $$ = [$1]; 
                    }}
                    ;


/*-----=====-----Produccion que a todas las variantes que tienen las producciones de la gramatica-----=====-----*/

simbolo     : ID_TERMINAL    
            {{
                $$ = { 
                    tipo: 'TERMINAL', 
                    valor: $1,
                    fila: @1.first_line,   
                    columna: @1.first_column + 1 
                };
            }}
            | ID_NO_TERMINAL
            {{
                $$ = { 
                    tipo: 'NO_TERMINAL', 
                    valor: $1,
                    fila: @1.first_line,   
                    columna: @1.first_column + 1 
                };
            }}
            ;