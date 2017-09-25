import * as program from 'commander';
import { red, green } from 'colors';
import { writeFileSync } from 'fs';
import { cinepolisMovies } from './cinepolis';

function getMovies (path: string) : void {
    let movies = cinepolisMovies();
    
    movies.subscribe(
        next => {
            writeFileSync(path, JSON.stringify(next, null, 4));
            console.log(green(`✔ Success: ${path}`));
        },
        error => console.log(red(`✗ Error: ${error}`))
    );
}

program
    .version('1.0.0')
    .description('Cinepolis web scraper tool')
    .option('-d, --directory <directory>', 'directory path where generated file is saved')
    .parse(process.argv);

getMovies(program.directory);