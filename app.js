const express = require('express')
const app = express()
app.use(express.json())

const port = 3000
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const dialogflow = require("dialogflow");
const req = require('request');


app.post("/webhook", (request, response) => {

  const agent = new WebhookClient({ request: request, response: response });
  // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  // console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


  function welcome(agent) {
    return agent.add(`¡Hola, soy el bot de búsqueda de SAP! ¿Que información deseas consultar?`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function claseDocumentoHandler(agent) {

    const claseDoc = agent.parameters.clasedocumento;
    //agent.add(`Clase de documento:`);
    //agent.add("AA");
    return fetchOdata(claseDoc).then(function (res) {

      let jsonResponse = JSON.parse(res);
      let sapDataCollection = jsonResponse.d.results;
      let sapDataCollectionFormatted = sapDataCollection.map(({ __metadata, ...rest }) => rest);
      let claseDoc = sapDataCollectionFormatted[0].ClaseDocumento;
      let denom = sapDataCollectionFormatted[0].Denominacion;
      agent.add(`Clase de documento-> ${claseDoc} | Denominacion-> ${denom}`);
    });

  }

  function fetchOdata(claseDoc) {
    return new Promise(function (resolve, reject) {
      let url = 'http://fiori.dlconsultores.com.ar:8080/sap/opu/odata/sap/ZDL_ODATA_JF_SRV';
      let csrfToken;
      //  let urlReq = "/TipoDocSet?$format=json";
      let urlReq = `/TipoDocSet?$filter=(ClaseDocumento eq'${claseDoc}')&$format=json`;
      req({
        url: url + urlReq,
        headers: {
          'Authorization': 'Basic ZGV2OkRMZGVwbG95',
          'Content-Type': 'application/json',
          'x-csrf-token': 'Fetch'
        }
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          csrfToken = response.headers['x-csrf-token'];
          console.log("{ x-csrf token: " + csrfToken + " }");
          resolve(response.body);
        } else {
          reject(response);
        }

      });
    });
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