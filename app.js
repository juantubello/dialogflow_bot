const express = require('express')
const app = express()
const oData = require('./modules/OData');
const Clima = require('./modules/Clima');
const Municipio = require('./modules/Municipio');
const DateCustom = require('./modules/Date');

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

    let userInput = (agent.query).toUpperCase();

    if (!(userInput.includes("CANCELAR") || userInput.includes("CANC") || userInput.includes("MENU"))) {
      agent.add("👋 ¡Hola , soy el bot de búsqueda!")
    }

    if (userInput.includes("CANCELAR") || userInput.includes("CANC") || userInput.includes("MENU")) {
      agent.add("¡Volviendo al menú...!")
    }

    agent.add(`¿Que información deseas consultar? 👇\r\n\r\n1 - Clima\r\n2 - Info SAP`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

/**
 * * This function is used to get the ClaseDocumento and Denominacion of a TipoDocSet entity
 * @param agent - The agent object that is calling the action.
 */
  async function claseDocumentoHandler(agent) {

    const claseDoc = agent.parameters.clasedocumento;

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
    agent.add(`▪ Clase de documento: ${claseDocumento}\r\n▪ Denominacion: ${denom}`);
    agent.add("Si deseas volver al Menú principal escribe 👉 Menu")

  }

/**
 * * Get the city from the user and the date from the user. 
 * * Call the API to get the weather information for the city and date. 
 * * If the city is not found, show error response and promt the user to go back to the menu. 
 * * If the city is found, ask the user if they want to know the weather for the next hours. 
 * * If the user wants to know the weather for the next hours, call the API to get the weather
 * information for the city and date. 
 * * If the user wants to go back to the main menu, call the API to get the main menu.
 * @param agent - The agent object that is currently handling the conversation.
 */
  async function climaHandler(agent) {
    console.log(agent.context.contexts)
    let city = agent.parameters.option;
    let date = DateCustom.format(agent.parameters.date)

    const climaRequest = {
      municipio: Municipio.getCode(city),
      municipioStr: Municipio.getName(city),
      apiKey: process.env.API_KEY,
      date: date
    }
    let climaResponse = await Clima.getClimaMunicipio(climaRequest);

    setContext(agent, climaResponse.message)
    agent.add(climaResponse.message);

    if (!climaResponse.notFound) {
      agent.add(`También puedo contarte sobre el clima detallado en ${climaRequest.municipioStr} para las próximas horas del día de hoy...\r\n \r\nSi deseas conocerlo escribe 👉 Si\r\n \r\n Si deseas volver al Menú principal escribe 👉 Menu`);
    }else{
      agent.add(`Si deseas volver al Menú principal escribe 👉 Menu`);
    }
  }

 /**
  * It returns the weather forecast for the next 5 days for a given city.
  * @param agent - The agent object that is currently handling the conversation.
  * @returns The weather forecast for the next 5 days.
  */
  async function climaDetalladoHandler(agent) {

    let contextResponse;

    for (var key in agent.context.contexts) {
      if (/clima-followup/.test(key)) {
        // console.log('match!', agent.context.contexts[key]); // do stuff here!
         contextResponse = agent.context.contexts[key].parameters.previousoutput
    }
  }

  if(contextResponse.includes("❌ No existen predicciones del tiempo para fechas tan lejanas o anteriores al día de hoy ❌")) {
    return agent.add("¿Cómo?")
  }

    let city = agent.parameters.option;
   
    const climaRequest = {
      municipio: Municipio.getCode(city),
      municipioStr: Municipio.getName(city),
      apiKey: process.env.API_KEY,
      date: DateCustom.today()
    }
    let climDetalladoResponse = await Clima.getClimaMunicipioDetallado(climaRequest)
    agent.add(`${climDetalladoResponse.message}\r\n Si deseas volver al Menú principal escribe 👉 Menu`);
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('NeedClaseDocumento', claseDocumentoHandler);
  intentMap.set('Clima', climaHandler);
  intentMap.set('ClimaDetallado', climaDetalladoHandler);
  
  agent.handleRequest(intentMap);

})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/**
 * * Set the context to the previous output
 * @param agent - the agent that received the message
 * @param message - The message that the user sent to the bot.
 */
function setContext(agent, message){
//update context to show full menu
let context = agent.context.get('clima-followup');
if (!context) throw "User_data context ius nod defined in PreferrenceAdd"

let context2 = new Object();
context2 = {'name': 'clima-followup', 'lifespan': 5, 
'parameters': context.parameters}; 

context2.parameters.previousoutput = message;
agent.context.set(context2);

}