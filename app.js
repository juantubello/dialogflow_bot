const express = require('express')
const app = express()
const oData = require('./modules/OData');
const Clima = require('./modules/Clima');
require('dotenv').config();

app.use(express.json())

const port = 3000
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const dialogflow = require("dialogflow");
const req = require('request');

app.post("/webhook", (request, response) => {

  const agent = new WebhookClient({ request: request, response: response });

  function welcome(agent) {
    return agent.add(`¡Hola, soy el bot de búsqueda de SAP! ¿Que información deseas consultar?`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  async function claseDocumentoHandler(agent) {

    const claseDoc = agent.parameters.clasedocumento;

    const climaRequest = {
      municipio: 46220,
      apiKey: process.env.API_KEY
    }
     let clima = await Clima.getClimaMunicipio(climaRequest);
  
     console.log(clima)

    let oDataRequest = {
      url: process.env.ODATA_URL,
      entity: "TipoDocSet",
      filter: "ClaseDocumento",
      value: claseDoc,
      basicAuth: process.env.BASIC_AUTH
    }

    let oDataResponse = await oData.get(oDataRequest);
    let claseDocumento = oDataResponse[0].ClaseDocumento;
    let denom = oDataResponse[0].Denominacion;
    agent.add(`Clase de documento: ${claseDocumento} | Denominacion: ${denom}`);

  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('NeedClaseDocumento', claseDocumentoHandler);
  agent.handleRequest(intentMap);

})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})