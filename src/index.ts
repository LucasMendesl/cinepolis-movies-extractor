import * as program from 'commander';
import { red, green } from 'colors';
import { extname, join, dirname } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { cinepolisMovies } from './cinepolis';

const errorMessage = (message: string) : void => console.log(red(message));

program
    .version('1.0.0')
    .description('Cinepolis web scraper tool')
    .option('-d, --directory <directory>', 'directory path where generated file is saved')
    .parse(process.argv);

const getPath = () : string => {
    let date = new Date();
    let fileName = `${date.toLocaleDateString().replace(/\//g, '')}.json`;
    
    if (!existsSync(program.directory)){
        errorMessage('✗ Error: no such directory with this name!'); 
        process.exit(-1); 
    }
    
    console.log(`dirname: ${dirname(program.directory), fileName}`);
    return join(dirname(program.directory), fileName);
} 

let movies = cinepolisMovies()
    .subscribe(
        next => {
            let filePath = getPath();            
            writeFileSync(filePath, JSON.stringify(next, null, 4));            
            
            console.log(green(`✔ Success: file has saved in directory ${filePath}`));
            process.exit(0);
        },
        error => {
            errorMessage(`✗ Error: ${error}`);
            process.exit(-1);
        }
);