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
            let notFound = true

            for (let i = 0; i < days.length; i++) {

                let responseDate = days[i].fecha.substring(0, 10);

                if (request.date === responseDate) {
                    notFound = false
                    temperaturaMaxima = days[i].temperatura.maxima
                    temperaturaMinima = days[i].temperatura.minima
                    sensacionMaxima = days[i].sensTermica.maxima
                    sensacionMinima = days[i].sensTermica.minima

                    for (let j = 0; j < days[i].estadoCielo.length; j++) {

                        if (days[i].estadoCielo[j].descripcion !== '') {
                            estadoCielo = days[i].estadoCielo[j].descripcion;
                            break;
                        }

                    }

                }

            }
            climaResponse = {
                "notFound": notFound,
                "message" : ""
            }

            if(notFound){
                climaResponse.message = "❌ No existen predicciones del tiempo para fechas tan lejanas o anteriores al día de hoy ❌"
                resolve(climaResponse)
                return
            }

            let emoji

            if (estadoCielo.includes("lluvia") || estadoCielo.includes("Lluvia") || estadoCielo.includes("LLUVIA")) {
                emoji = `🌧️`
            }else if(estadoCielo.includes("Tormenta") || estadoCielo.includes("tormenta") || estadoCielo.includes("TORMENTA")){
                emoji = `🌩️`
            }
            else if(estadoCielo.includes("Intervalos Nubosos") || estadoCielo.includes("Intervalos nubosos") ){
                emoji = `⛅`
            }
            else if(estadoCielo.includes("Nuboso") || estadoCielo.includes("Nubos") || estadoCielo.includes("nuboso")){
                emoji = `☁️`
            }else{
                emoji = `☀️`
            }


            let dateString = DateCustom.dayString(request.date)

            let res = `Para el dia ${dateString} se esperan en ${request.municipioStr}\r\n ● Temperaturas🌡️\r\n ↑ max. ${temperaturaMaxima}°C / ↓ min. ${temperaturaMinima}°C\r\n`
            res = res + `● Sensacion Térmica🌡️\r\n ↑ max.  ${sensacionMaxima}°C / ↓ min. ${sensacionMinima}°C\r\n`
            res = res + `● Estado del cielo 🌞​\r\n ${emoji} ${estadoCielo}`

            climaResponse.message = res

            resolve(climaResponse)
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

