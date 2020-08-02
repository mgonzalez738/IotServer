const { EventHubConsumerClient } = require("@azure/event-hubs");
const gatewayDataController = require('../controllers/gatewayDataController');

const consumerClient = new EventHubConsumerClient(process.env.IOT_HUB_EVENT_CONSUMER_GROUP, process.env.IOT_HUB_EVENT_ENDPOINT);

// Procesa los eventos recibidos
var processMessages = function (messages) {
    for (const message of messages) {
      
      // Eventos de Telemetria
      if(message.systemProperties['iothub-message-source'] == "Telemetry")
      {
        var logMessage = "\x1b[33mEventHubEndpoint(" + process.env.IOT_HUB_HOST + "): Telemetria(" + message.body.UtcTime + ")";

        // Datos
        if(message.properties.MessageType == "Data")
        {
          // Log
          logMessage = logMessage + " | " + message.properties.DeviceType + "(" + message.systemProperties['iothub-connection-device-id'] + ") | Data \x1b[0m";
          console.log(logMessage);
          // Guarda en Db 
          saveDataToDb(message);
        }

        // Eventos
        if(message.properties.MessageType == "Event")
        {
          // Log
          logMessage = logMessage + " | " + message.properties.DeviceType + " (" + message.systemProperties['iothub-connection-device-id'] + ") | Event \x1b[0m";
          console.log(logMessage);
          // Guarda en Db 
          saveEventToDb(message);
        }
      }

      // Actualizacion Propiedades
      if(message.systemProperties['iothub-message-source'] == "twinChangeEvents")
      {
        // Filtro modulos hub y edge
        if((message.properties['moduleId'] != '$edgeAgent') && (message.properties['moduleId'] != '$edgeHub'))
        {       
          // Reportadas
          if(message.body.properties['reported'] != undefined)
          {
            // Log
            var logMessage = "\x1b[33mEventHubEndpoint(" + process.env.IOT_HUB_HOST + "): Actualización Propiedades Reportadas";          
            logMessage = logMessage + " | (" + message.systemProperties['iothub-connection-device-id'] + ").\x1b[0m";
            console.log(logMessage);
          }
        }
      }
    }
  };

  // Guarda el mensaje de datos en dB
  var saveDataToDb = function (msg) {
    switch( msg.properties.DeviceType) {
      case "Gateway":
        gatewayDataController.saveData(msg.systemProperties['iothub-connection-device-id'], msg.body);
        break;
    }
  }

  var saveEventToDb = function (msg) {
    switch( msg.properties.DeviceType) {
      case "Gateway":
        //gatewayDataController.saveData(msg.systemProperties['iothub-connection-device-id'], msg.body);
        break;
    }
  }

  var printError = function (err) {
    console.log(err.message);
  };

exports.suscribe = () => {
    consumerClient.subscribe({
        processEvents: processMessages,
        processError: printError,
    });
}