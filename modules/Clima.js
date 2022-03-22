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

            let req = {
                url: response.data.datos
            }

            let clima = await getClima(req)
            resolve(clima)
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
            resolve(JSON.stringify(response.data));
        }

    });
}

