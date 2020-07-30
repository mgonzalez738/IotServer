const { EventHubConsumerClient } = require("@azure/event-hubs");
const gatewayDataController = require('../controllers/gatewayDataController');

const consumerClient = new EventHubConsumerClient(process.env.IOT_HUB_EVENT_CONSUMER_GROUP, process.env.IOT_HUB_EVENT_ENDPOINT);

var processMessages = function (messages) {
    for (const message of messages) {
      
      // Telemetria
      if(message.systemProperties['iothub-message-source'] == "Telemetry")
      {
        console.log("\x1b[33mTelemetria recibida (" + message.body.UtcTime + ")\x1b[0m");
        console.log("Id Dispositivo: " + message.systemProperties['iothub-connection-device-id']);
        console.log("Tipo Dispositivo: " + message.properties.DeviceType);

        // Datos
        if(message.properties.MessageType == "Data")
        {
            console.log("Tipo de Mensaje: Datos");
            if( message.properties.DeviceType = "Gateway")
                gatewayDataController.saveData(message.systemProperties['iothub-connection-device-id'], message.body);
        }

        // Eventos
        if(message.properties.MessageType == "Event")
        {
            console.log("Tipo de Mensaje: Evento");
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
            console.log("\x1b[33mActualizacion propiedades\x1b[0m");
            console.log("Id Dispositivo: " + message.systemProperties['iothub-connection-device-id']);
          }
        }
      }
    }
  };

  var printError = function (err) {
    console.log(err.message);
  };

exports.suscribe = () => {
    consumerClient.subscribe({
        processEvents: processMessages,
        processError: printError,
    });
}