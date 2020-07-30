const Gateway = require("../models/gatewayModel");
const config = require("../config");
var mongoose = require('mongoose');
var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

// Conexion al IoT Hub
var iotHubConnectionString = "HostName=" + config.iotHub.HostName + ";" +
                             "SharedAccessKeyName=" + config.iotHub.SharedAccessKeyName + ";" +
                             "SharedAccessKey=" + config.iotHub.SharedAccessKey;
var registry = Registry.fromConnectionString(iotHubConnectionString);
var client = Client.fromConnectionString(iotHubConnectionString);

exports.index = async (req, res, next) => {
    try {
        const gateways = await Gateway.find().sort({ CreatedAt: -1 });
        res.send(gateways);
    } catch (err) {
        next(err);
    }
};

exports.show = async (req, res, next) => {
    try {
        const gateway = await Gateway.findOne({ 
            _id: req.params.id
        });
        res.send(gateway);
    } catch (err) {
        next(err);
    }
};

exports.store = async (req, res, next) => {
    try {
        //validationHandler(req);  
        
        // Crea el dispositivo edge para el IoT Hub
        var device = {
            deviceId: mongoose.Types.ObjectId().toHexString(),
            status: 'enabled',
            capabilities: {
                iotEdge: true
            },
        };

        // Crea los Tags y propiedades del gemelo
        var twinData = {
            tags: {
                Name: req.body.Name,
                Description: "Raspberry Gateway",
                SerialNumber: "",
                Latitude: 0,
                Longitude: 0
            }
        };

        // Cadena de conexion del dispositivo
        let deviceConnectionString = "";

        // Registra el dispositivo
        registry.create(device, function (err) {
            if(err) {
                console.error('Could not create device: ' + err.message);
            } 
            else {
                // Obtiene la cadena de conexion (TODO)
                registry.get(device.deviceId, function(err, deviceInfo) {
                    if(err) {
                        console.error('Could not get device: ' + err.message);
                    } else {
                        deviceConnectionString = "HostName=" + config.iotHub.HostName + ";" +
                                                 "DeviceId=" + deviceInfo.deviceId + ";" +
                                                 "SharedAccessKey=" + deviceInfo.authentication.symmetricKey.primaryKey;
                        //Actualiza los tags
                        registry.getTwin(device.deviceId, function(err, twin){
                            if (err) {
                                console.error('Could not get device twin: ' + err.message);
                            } else {                          
                                twin.update(twinData, async function(err) {
                                    if (err) {
                                        console.error('Could not update device twin: ' + err.message);
                                    } else {
                                        let gateway = new Gateway();
                                        gateway._id = device.deviceId;
                                        gateway.ConnectionString = deviceConnectionString;
                                        gateway.Tags= twinData.tags;
                                        gateway = await gateway.save();
                                        console.log("Gateway " +  gateway.Tags.Name + " (ID =" + gateway._id + ") creado en Hub y Db.");
                                        res.send(gateway);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });         
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        
        registry.delete(req.params.id, async function (err) {
            if(err) {
                console.error('Could not delete device: ' + err.message);
            } 
            else {
                    let gateway = await Gateway.findOne({ 
                        _id: req.params.id
                    });
                    await gateway.delete();
                    console.log("Gateway " +  gateway.Tags.Name + " (ID = " + gateway._id + ") eliminado en Hub y Db.");
                    res.send({message: "success"});
            }
        });
    } catch (err) {
        next(err);
    }
};

