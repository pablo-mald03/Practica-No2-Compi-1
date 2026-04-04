/* Seccion analizador Lexico */
%lex
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

/*----Simbolo inicial----*/

%start inicio

%%

/*-----=====-----Produccion principal de inicio-----=====-----*/

inicio
    : WISON QUEST_APERTURA cuerpo  QUEST_CIERRE WISON  EOF 
    { 
        return $3; 
    }
    ;

/*-----=====-----Produccion del cuerpo general de Wison-----=====-----*/

cuerpo 
    : LEX LLAVE_APERTURA DOS_PUNTOS estructura_lexica DOS_PUNTOS LLAVE_CIERRE SYNTAX_PARSER  
    LLAVE_APERTURA LLAVE_APERTURA DOS_PUNTOS estructura_sintactica DOS_PUNTOS LLAVE_CIERRE LLAVE_CIERRE
    {{
        $$ = {
            lexico: $4,
            sintactico: $11
        };
    }}
    ;

/*-----=====-----Produccion que define a la estructura lexica-----=====-----*/

estructura_lexica 
                : estructura_lexica produccion_terminal
                {
                    $1.push($2);
                    $$  = $1;
                }
                | produccion_terminal
                {
                    $$ = [$1];
                }
                ;


/*-----=====-----Producciones individuales del apartado lexico-----=====-----*/

produccion_terminal : TERMINAL ID_TERMINAL  MENOR MENOS regla_lexica PUNTO_COMA
                    {{

                        $$ = {
                            tipo: 'TERMINAL',
                            id: $2,
                            regla: $5
                        }

                    }}
                    ;

/*-----=====-----Producciones individuales del apartado lexico-----=====-----*/

regla_lexica    : regla_lexica elemento_lexico
                {
                    $1.push($2);
                    $$ = $1;
                }
                | elemento_lexico
                {
                    $$ = [$1];
                }
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
                        valor: $1
                    };
                }}
                | PARENT_APERTURA regla_lexica PARENT_CIERRE
                {{
                    $$ = {
                        tipo: 'AGRUPACION',
                        contenido: $2
                    };
                }}
                | ID_TERMINAL 
                {{
                    $$ = { 
                            tipo: 'REFERENCIA_ID', 
                            valor: $1 
                    };
                }}
                | RANGO_NUMERO 
                {{
                    $$ = { 
                            tipo: 'RANGO', 
                            valor: '[0-9]' 
                    };
                }}
                | RANGO_MINUSCULA
                {{
                    $$ = { 
                            tipo: 'RANGO', 
                            valor: '[a-z]' 
                    };
                }}
                | RANGO_MAYUSCULA
                {{
                    $$ = { 
                            tipo: 'RANGO', 
                            valor: '[A-Z]' 
                    };
                }}
                | RANGO_TOTAL
                {{
                    $$ = { 
                            tipo: 'RANGO', 
                            valor: '[a-zA-Z]' 
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
                    ;


/*-----=====-----Produccion de la estructura de los no terminales-----=====-----*/

non_terminales      : NO_TERMINAL ID_NO_TERMINAL PUNTO_COMA
                    {{
                        $$ = { 
                                tipo: 'DECLARACION_NT', 
                                id: $2 
                        };
                    }}
                    ;


/*-----=====-----Produccion del simbolo inicial de la gramatica-----=====-----*/

sim_inicial     : SIMBOLO_INICIAL ID_NO_TERMINAL PUNTO_COMA
                {{
                    $$ = { 
                            tipo: 'SIMBOLO_INICIAL', 
                            id: $2 
                    };
                }}
                ;


/*-----=====-----Produccion que define a la declaracion de las reglas de producion de la gramatica-----=====-----*/

regla_produccion    : ID_NO_TERMINAL MENOR IGUAL lista_alternativas PUNTO_COMA
                    {{
                        $$ = {
                            tipo: 'PRODUCCION',
                            padre: $1,
                            alternativas: $4
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

cuerpo_produccion : cuerpo_produccion simbolo
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
                        valor: $1 
                };
            }}
            | ID_NO_TERMINAL
            {{
                $$ = { 
                        tipo: 'NO_TERMINAL', 
                        valor: $1 
                };
            }}
            ;