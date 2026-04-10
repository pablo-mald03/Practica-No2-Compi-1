import { json } from '@sveltejs/kit';
import jison from 'jison';

/*Metodo post delegado para poder compilar el archivo .jison generado como LEXER dinamicamente en la aplicacion*/
export async function POST({ request }) {
    try {

        const { lexerJison, nombreArchivo } = await request.json();


        const jisonParser = new jison.Parser(lexerJison);
        const nombreModulo = `Lexer_${nombreArchivo}`;
        

        let lexerJSCompilado = jisonParser.generate({ moduleName: nombreModulo });


        lexerJSCompilado += `\n\n/* --- Ajuste ESM Dinamico --- */\n`;
        lexerJSCompilado += `export const parse = (input) => ${nombreModulo}.parse(input);\n`;
        lexerJSCompilado += `export default ${nombreModulo};\n`;

        return json({ exito: true, lexerJSCompilado });

    } catch (error) {
        return json({ exito: false, error: error.message }, { status: 500 });
    }
}