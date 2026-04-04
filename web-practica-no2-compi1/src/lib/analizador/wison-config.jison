/* Seccion analizador Lexico */
%lex
%%
\s+                   /* ignorar espacios */
[0-9]+                return 'NUMERO';
"+"                   return 'MAS';
<<EOF>>               return 'EOF';

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