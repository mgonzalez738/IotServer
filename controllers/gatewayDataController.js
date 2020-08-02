const GatewayData = require("../models/gatewayDataModel");
var mongoose = require('mongoose');

exports.index = async (req, res, next) => {
    try {
        var gwId = req.params.id;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")";
        console.log(logMessage);

        const gatewayData = await GatewayData.find({ _gatewayId: req.params.id }).sort({ "Data.UtcTime": -1 });
        if(!gatewayData.length)
        {
            var msg = "Resource _id = " + req.params.id + " not found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(all) | \x1b[31mError retrieving \x1b[35m -> " + msg + "\x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(all) | Retrieved\x1b[0m");
            res.send(gatewayData);
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(all) | \x1b[31mError retrieving \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.show = async (req, res, next) => {
    try {
        var gwId = req.params.id;
        var dataId = req.params.subid;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")" + " | Data(" + dataId + ")";
        console.log(logMessage);

        const gatewayData = await GatewayData.findOne({ _gatewayId: gwId, _id: dataId });

        if(gatewayData == null)
        {
            var msg = "Resource _gatewayId = " + req.params.id + " and _id = " + req.params.subid + " not found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | \x1b[31mError retrieving \x1b[35m -> " + msg + "\x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | Retrieved\x1b[0m");
            res.send(gatewayData);
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | \x1b[31mError retrieving \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.store = async (req, res, next) => {
    try {
        //validationHandler(req);  
        var dataId = mongoose.Types.ObjectId().toHexString();
        var gwId = req.params.id;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ") | Data(" + dataId + ")";
        console.log(logMessage);

        let gatewayData = new GatewayData();
        gatewayData._id = dataId;
        gatewayData._gatewayId = gwId;
        gatewayData.Data = req.body;
        gatewayData = await gatewayData.save();
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | Saved\x1b[0m");
        res.send(gatewayData);
    } catch (err) {
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | \x1b[31mError saving \x1b[35m -> " + err.message + "\x1b[0m");
        next(err);
    }
};

exports.saveData = async (dataId, gwId, data) => {
    try {              
        let gatewayData = new GatewayData();
        gatewayData._id = dataId; 
        gatewayData._gatewayId = gwId;
        gatewayData.Data = data;
        gatewayData = await gatewayData.save(); 
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | Saved\x1b[0m");   
    } catch (err) {
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + dataId + ") | \x1b[31mError saving \x1b[35m -> " + err.message + "\x1b[0m");
    }
};


