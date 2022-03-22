const axios = require('axios');

module.exports.getClimaMunicipio = async function (request) {
    return new Promise(async function (resolve, reject) {
        let config = {
            method: 'get',
            url: `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${request.municipio}`,
            headers: {
                'Accept': 'application/json',
                'api_key': `${request.apiKey}`
            }
        };

        let response;

        try {
            response = await axios(config);
        } catch (error) {
            reject(error)
        }

        if (response) {

            let temperaturaMaxima, temperaturaMinima, sensacionMaxima, sensacionMinima, estadoCielo;

            let req = {
                url: response.data.datos
            }

            let clima = await getClima(req)
            let days = clima[0].prediccion.dia;

            for (let i = 0; i < days.length; i++) {
                
                let responseDate = days[i].fecha.substring(0, 10);

                if(request.date === responseDate){
                    
                    temperaturaMaxima = days[i].temperatura.maxima
                    temperaturaMinima = days[i].temperatura.minima
                    sensacionMaxima = days[i].sensTermica.minima
                    sensacionMinima = days[i].sensTermica.minima

                    for (let j = 0; j < days[i].estadoCielo.length; j++) {
                        
                        if(days[i].estadoCielo[j].descripcion !== ''){
                            estadoCielo = days[i].estadoCielo[j].descripcion;
                            break;
                        }

                    } 

                }
               
             }

             let res = {
                 "temperaturaMaxima": temperaturaMaxima,
                 "temperaturaMinima": temperaturaMinima,
                 "sensacionMaxima": sensacionMaxima,
                 "sensacionMinima": sensacionMinima,
                 "estadoCielo" : estadoCielo
             }
            // let temperaturaMaxima = days.temperatura.maxima;

            resolve(res)
        }
    });
}

function getClima(request) {
    return new Promise(async function (resolve, reject) {
        let response;

        let config = {
            method: 'get',
            url: request.url
        };

        try {
            response = await axios(config);
        } catch (error) {
            reject(error)
        }

        if (response) {
            let data = JSON.stringify(response.data);
            data = JSON.parse(data);
            resolve(data);
        }

    });
}

