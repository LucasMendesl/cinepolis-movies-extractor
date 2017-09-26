import { load } from 'cheerio';
import { Observable } from 'rxjs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

declare type CinepolisCitiesResponse = {} | string[];
declare type CinepolisObservableResponse = {} | CinepolisData[];

interface Movie {
    title: string;
    times: string[];
}

interface CinepolisResult {
    result: CinepolisData[];
} 

interface CinepolisData {
    cinemaName: string;
    movies: Movie[];
    showtimeDate: string;
}

const BASE_URL = 'https://www.cinepolis.com.pe';

const request = (configuration: AxiosRequestConfig) : Observable<AxiosResponse> =>
     Observable.fromPromise(axios(configuration));

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
axios.defaults.headers.common['Host'] = 'www.cinepolis.com.pe';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.headers.post['Accept'] = 'application/json, text/plain, */*';

function getCinepolisCities () : Observable<CinepolisCitiesResponse> {
    return request({
        method: 'get',
        url: BASE_URL,
        withCredentials: true,
    })
    .map(getOptions)
    .catch(e => { throw e; });
}

function getMovies (cities: any) : Observable<any[]> {
   let responses = cities.map(city => request({
                                method: 'post',
                                url: `${BASE_URL}/Cartelera.aspx/GetNowPlayingByCity`,
                                withCredentials: true,
                                data: { claveCiudad: city, esVIP: false }}).map(x => x.data));

    return Observable.forkJoin(responses);
}

function getOptions (res: AxiosResponse) : string[] {
    let $ = load(res.data);
    let result = [];

    let options = $("#cmbCiudades option").filter((key, option) => /[0-9]$/.test($(option).val()));

    for (let i = 0; i < options.length; i++) 
        result.push($(options[i]).attr('clave'));                                       
                                            
    return result;
}

function buildResult (cinepolisData: any) : CinepolisData[] {        
    let values = cinepolisData.map(cinepolis => {
        return cinepolis.dates.map(date => {
            return {
                name: cinepolis.name,
                movies: date.Movies.map(x => {
                    return {
                        title: x.Title,
                        times: x.Formats.map(format => format.Showtimes.map(sw => sw.Time))
                                        .reduce((prev, curr) => prev.concat(curr), [])                                        
                    }
                }),
                showtimeDate: date.ShowtimeDate
            }
        });
    });

    return values;
}

function mapToResult (data: any[]) : CinepolisResult {
    return {
        result: data.map(obj => {
            return obj.d.Cinemas.map(cinema => {
                return {
                   name: cinema.Name,
                   dates: cinema.Dates
                }
            });
        })
        .reduce((prev, current) => prev.concat(buildResult(current)), [])
    };
}

export function cinepolisMovies () : Observable<CinepolisObservableResponse> {
    return getCinepolisCities()
            .flatMap(getMovies)
            .map(mapToResult)
            .catch(e => { throw e; });
}