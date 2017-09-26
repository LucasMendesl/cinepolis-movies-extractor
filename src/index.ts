import * as program from 'commander';
import { red, green } from 'colors';
import { extname, join, resolve } from 'path';
import { writeFile, existsSync } from 'fs';
import cinepolisMovies from './cinepolis';

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

    return join(resolve(program.directory), fileName);
} 

const saveFile = (next: any) : void => {
    let filePath = getPath();
    
    writeFile(filePath, JSON.stringify(next, null, 4), (err) => {
        if (err) {
           errorMessage(`✗ Error: ${err.message}`);
           process.exit(-1);
        }
    
        console.log(green(`✔ Success: file has saved in directory ${filePath}`));
        process.exit(0);    
    });                            
}

const handleError = (error: any) => {
    errorMessage(`✗ Error: ${error}`);
    process.exit(-1);
}

cinepolisMovies()
    .subscribe(saveFile, handleError);   