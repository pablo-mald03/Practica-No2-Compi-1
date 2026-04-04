/* Seccion analizador Lexico */
%lex
%%
/*Espacios y saltos de linea*/

\s+                   /* ignorar espacios */

/*Apartado de comentarios*/

"#".*           /*Ignorar comentario de linea*/

"/**"([^*]|\*+[^*/])*(\*+"/")           /*Ignorar comentario multilinea*/ 


/*---*******------Expresiones regulares reglas lexicas aceptadas en el lenguaje------*******---*/

"[0-9]"                     return '[0-9]';

"[a-z]"                     return '[a-z]';

"[A-Z]"                     return '[A-Z]';

"[aA-zZ]"                     return '[aA-zZ]';


/*---*******------Palabras reservadas del lenguaje------*******---*/

"Wison"                     return 'WISON';

"lex"                       return "LEX";

"Terminal"                  return "TERMINAL";



/*---*******------Caracteres especiales del lenguaje------*******---*/

"{"                         return 'PARENT_APERTURA';

"}"                         return 'PARENT_CIERRE';

"["                         return 'CORCHETE_CIERRE';

"]"                         return 'CORCHETE_APERTURA';

":"                         return 'DOS_PUNTOS';

"<"                         return 'MENOR';

";"                         return 'PUNTO_COMA';

"|"                         return 'OR_EXP';


/*---*******------Caracteres que permiten usar expresiones regulares en el lenguaje wison------*******---*/

"-"                         return '-';

"+"                         return '+';

"*"                         return '*';

"¿"                         return '¿';

"?"                         return '?';


[0-9]+                      return 'NUMERO';



<<EOF>>                     return 'EOF';

/lex

/* Seccion del analizador Sintactico */
%%

inicio
    : expresion EOF { return $1; }
    ;

expresion
    : NUMERO MAS NUMERO { $$ = Number($1) + Number($3); }
    | NUMERO            { $$ = Number($1); }
    ;