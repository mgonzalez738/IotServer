const GatewayData = require("../models/gatewayDataModel");
var mongoose = require('mongoose');

exports.index = async (req, res, next) => {
    try {
        const gatewayData = await GatewayData.find({ GatewayId: req.params.id });
        res.send(gatewayData);
    } catch (err) {
        next(err);
    }
};

exports.store = async (req, res, next) => {
    try {
        //validationHandler(req);  
                
        let gatewayData = new GatewayData();
        gatewayData.GatewayId = req.params.id;
        gatewayData.Data = req.body;
        gatewayData = await gatewayData.save();
        console.log("GatewayData (ID = " + gatewayData.GatewayId + ") guardados en Db.");
        res.send(gatewayData);
       
    } catch (err) {
        next(err);
    }
};

exports.saveData = async (gwId, data) => {
    try {                
        let gatewayData = new GatewayData();
        gatewayData.GatewayId = gwId;
        gatewayData.Data = data;
        gatewayData = await gatewayData.save();
        console.log("GatewayData (ID = " + gatewayData.GatewayId + ") guardados en Db.");       
    } catch (err) {
        console.log(err);
    }
};


