const DateCustom = require('./Date');

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

                if (request.date === responseDate) {

                    temperaturaMaxima = days[i].temperatura.maxima
                    temperaturaMinima = days[i].temperatura.minima
                    sensacionMaxima = days[i].sensTermica.minima
                    sensacionMinima = days[i].sensTermica.minima

                    for (let j = 0; j < days[i].estadoCielo.length; j++) {

                        if (days[i].estadoCielo[j].descripcion !== '') {
                            estadoCielo = days[i].estadoCielo[j].descripcion;
                            break;
                        }

                    }

                }

            }
            let dateString = DateCustom.dayString(request.date)

            let res = `Para el dia ${dateString} se esperan en el municipio de ${request.municipioStr}\r\n ● Temperaturas🌡️\r\n ↑ Máximas de ${temperaturaMaxima}°C \r\n`
            res = res + `↓ Minimas de ${temperaturaMinima}°C\r\n`
            res = res + `● Sensacion Térmica🌡️\r\n ↑ Máxima de ${sensacionMaxima}°C \r\n`
            res = res + `↓ Minima de ${sensacionMinima}°C\r\n`
            res = res + `● Estado del cielo 🌞​\r\n ⛅ ${estadoCielo}`

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

