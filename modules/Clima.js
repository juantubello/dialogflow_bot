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
                "message": ""
            }

            if (notFound) {
                climaResponse.message = "❌ No existen predicciones del tiempo para fechas tan lejanas o anteriores al día de hoy ❌"
                resolve(climaResponse)
                return
            }

            let emoji

            if (estadoCielo.includes("lluvia") || estadoCielo.includes("Lluvia") || estadoCielo.includes("LLUVIA")) {
                emoji = `🌧️`
            } else if (estadoCielo.includes("Tormenta") || estadoCielo.includes("tormenta") || estadoCielo.includes("TORMENTA")) {
                emoji = `🌩️`
            }
            else if (estadoCielo.includes("Intervalos Nubosos") || estadoCielo.includes("Intervalos nubosos")) {
                emoji = `⛅`
            }
            else if (estadoCielo.includes("Nuboso") || estadoCielo.includes("Nubos") || estadoCielo.includes("nuboso")) {
                emoji = `☁️`
            } else {
                emoji = `☀️`
            }


            let dateString = DateCustom.dayString(request.date)

            let res = `Para el dia ${dateString}, se esperan en ${request.municipioStr}... 👇\r\n\r\n ● Temperaturas🌡️\r\n ↑ max. ${temperaturaMaxima}°C / ↓ min. ${temperaturaMinima}°C\r\n\r\n`
            res = res + `● Sensacion Térmica🌡️\r\n ↑ max.  ${sensacionMaxima}°C / ↓ min. ${sensacionMinima}°C\r\n\r\n`
            res = res + `● Estado del cielo 🌞​\r\n ${emoji} ${estadoCielo}`

            climaResponse.message = res

            resolve(climaResponse)
        }
    });
}

module.exports.getClimaMunicipioDetallado = async function (request) {
    return new Promise(async function (resolve, reject) {

        const early_morning = {
            cielo: "00-06",
            temp: 6,
            clock: `🕛`
        }

        const morning = {
            cielo: "06-12",
            temp: 12,
            clock: `🕕`
        }

        const noon = {
            cielo: "12-18",
            temp: 18,
            clock: `🕛`
        }

        const night = {
            cielo: "18-24",
            temp: 24,
            clock: `🕕`
        }

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

            let req = {
                url: response.data.datos
            }

            let clima = await getClima(req)
            let days = clima[0].prediccion.dia;

            let earlyMorningValues = getDetailMessage(days, early_morning)
            let morningValues = getDetailMessage(days, morning)
            let noonValues = getDetailMessage(days, noon)
            let nightValues = getDetailMessage(days, night)

            climaResponse = {
                "message": ""
            }

            let one = `Clima detallado en ${request.municipioStr} para el día de hoy... 👇\r\n\r\n`
            res = one + earlyMorningValues + morningValues + noonValues + nightValues;

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

function getDetailMessage(prediction, filters) {

    let response = {
        hour: filters.cielo,
        sky: "",
        temp: ""
    }

    for (let indexPrediction = 0; indexPrediction < prediction.length; indexPrediction++) {

        let responseDate = prediction[indexPrediction].fecha.substring(0, 10);

        let date = DateCustom.today()

        if (date === responseDate) {

            for (let indexCielo = 0; indexCielo < prediction[indexPrediction].estadoCielo.length; indexCielo++) {

                let periodoRes = prediction[indexPrediction].estadoCielo[indexCielo].periodo
                let descRes = prediction[indexPrediction].estadoCielo[indexCielo].descripcion

                if (periodoRes === filters.cielo && descRes !== '') {
                    response.sky = descRes;
                    break;
                }

            }

            if (response.sky !== '') {

                for (let indexTemperatura = 0; indexTemperatura < prediction[indexPrediction].temperatura.dato.length; indexTemperatura++) {
                    if (prediction[indexPrediction].temperatura.dato[indexTemperatura].hora === filters.temp) {
                        response.temp = prediction[indexPrediction].temperatura.dato[indexTemperatura].value;
                        break;
                    }
                }
            }
        }

    }
  if (response.sky !== '') { 

    let emoji

    if (response.sky.includes("lluvia") || response.sky.includes("Lluvia") || response.sky.includes("LLUVIA")) {
        emoji = `🌧️`
    } else if (response.sky.includes("Tormenta") || response.sky.includes("tormenta") || response.sky.includes("TORMENTA")) {
        emoji = `🌩️`
    }
    else if (response.sky.includes("Intervalos Nubosos") || response.sky.includes("Intervalos nubosos")) {
        emoji = `⛅`
    }
    else if (response.sky.includes("Nuboso") || response.sky.includes("Nubos") || response.sky.includes("nuboso")) {
        emoji = `☁️`
    } else {
        emoji = `☀️`
    }

    return `${filters.clock}${filters.cielo}h 🌡️${response.temp}°C ${emoji}${response.sky}\r\n`;
  }

  return ''
    
}

