import jison from 'jison';
import fs from 'fs';
import path from 'path';

const grammarPath = './src/lib/analizador/wison-config.jison';
const outputPath = './src/lib/analizador/wison-parser.js';

const grammar = fs.readFileSync(grammarPath, 'utf8');
const parser = new jison.Generator(grammar);
const parserSource = parser.generate({ moduleType: 'commonjs' });

/*Ajuste para poderlo hacer comatible con los modulos de svelte*/
const esmSource = `
${parserSource}
export const parse = (input) => parser.parse(input);
export default parser;
`;

fs.writeFileSync(outputPath, esmSource);