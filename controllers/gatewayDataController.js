const GatewayData = require("../models/gatewayDataModel");
const url = require('url');
var mongoose = require('mongoose');

exports.index = async (req, res, next) => {
    try {
        var gwId = req.params.id;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")";
        logMessage = logMessage + " | Retrieve Data";

        // Verifica si hay parametros en la url

        var filterFromEnabled = false;
        if(req.query.from !== undefined)
        {
            filterFromEnabled = true;
            logMessage = logMessage + " (From)";
            var fromDateTime = new Date(req.query.from);
            var fromDate = new Date((req.query.from).split('T')[0])       
            if(!isValidDate(fromDateTime) || !isValidDate(fromDateTime))
            {
                var msg = "Parameter 'from' must be a valid ISO8601 format date string" 
                next({
                    statusCode: 400, // Bad Request
                    message: msg
                });
                logMessage = logMessage + " | \x1b[31mError\x1b[34m -> " + msg + "\x1b[0m";
                console.log(logMessage);
                return;
            }
        }

        var filterToEnabled = false;
        if(req.query.to !== undefined)
        {
            filterToEnabled = true;
            logMessage = logMessage + " (To)";
            var toDateTime = new Date(req.query.to);
            var toDate = new Date((req.query.to).split('T')[0])       
            if(!isValidDate(toDateTime) || !isValidDate(toDateTime))
            {
                var msg = "Parameter 'to' must be a valid ISO8601 format date string" 
                next({
                    statusCode: 400, // Bad Request
                    message: msg
                });
                logMessage = logMessage + " | \x1b[31mError\x1b[34m -> " + msg + "\x1b[0m";
                console.log(logMessage);
                return;
            }
        }

        // Verifica si hay un array de queries adicionales (aggregate) en body
        var queriesEnabled = false;
        var arrayConstructor = [].constructor;
        if(Object.keys(req.body).length !== 0)
        {
            logMessage = logMessage + " (Query)";
            if(req.body.constructor !== [].constructor) 
            {
                var msg = "Body must contain an array of json queries" 
                next({
                    statusCode: 400, // Bad Request
                    message: msg
                });
                logMessage = logMessage + " | \x1b[31mError\x1b[34m -> " + msg + "\x1b[0m";
                console.log(logMessage);
                return;
            }
            queriesEnabled = true;
        }
        
        logMessage = logMessage + "\x1b[0m";
        console.log(logMessage);
        
        // Arma el Aggregate

        // Primer Match (Antes de Unwind y Project): Filtra por gateway
        var firstMatch = { $match : { $and: [ { _gatewayId: new mongoose.Types.ObjectId(gwId) } ] } };
        // Parametro consulta "from"
        if(filterFromEnabled)
            firstMatch.$match.$and.push({DocDate: {$gte: fromDate }});
        // Parametro consulta "to"
        if(filterToEnabled)
            firstMatch.$match.$and.push({DocDate: {$lte: toDate }});

        // Segundo Match (Despues de Unwind y Project)
        var secondMatch = { $match : { $and: [ ] } };
        // Parametro consulta "from"
        if(filterFromEnabled)
            secondMatch.$match.$and.push({UtcTime: {$gte: fromDateTime }});
        // Parametro consulta "to"
        if(filterToEnabled)
            secondMatch.$match.$and.push({UtcTime: {$lte: toDateTime }});

        var aggregation = [firstMatch];       
        aggregation.push({ $unwind : { path: "$Data" } });
        aggregation.push({ 
            $project : { 
                _id: "$Data._id",
                UtcTime: "$Data.UtcTime", 
                PowerVoltage : "$Data.PowerVoltage",
                SensedVoltage: "$Data.SensedVoltage",
                BatteryVoltage: "$Data.BatteryVoltage",
                Temperature: "$Data.Temperature" 
            } 
        });
        if(filterFromEnabled || filterToEnabled)
            aggregation.push( secondMatch );
        if(queriesEnabled)
            req.body.forEach(function(item,index,arr) {
                aggregation.push( item );
            });
        aggregation.push( { $sort : { UtcTime: - 1 } } );

        const gatewayData = await GatewayData.aggregate(aggregation);

        if(!gatewayData.length)
        {
            var msg = "No data found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data retrieved (0 records) \x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data retrieved (" + gatewayData.length + " records)\x1b[0m");
            res.send(gatewayData);
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError retrieving data \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.show = async (req, res, next) => {
    try {
        var gwId = req.params.id;
        var dataId = req.params.subid;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")" + " | Data(" + dataId + ")";
        console.log(logMessage);

        var aggregation = [{ $match : { _gatewayId: new mongoose.Types.ObjectId(gwId) } }];       
        aggregation.push({ $unwind : { path: "$Data" } });
        aggregation.push({ 
            $project : {
                _id: "$Data._id",
                UtcTime: "$Data.UtcTime", 
                PowerVoltage : "$Data.PowerVoltage",
                SensedVoltage: "$Data.SensedVoltage",
                BatteryVoltage: "$Data.BatteryVoltage",
                Temperature: "$Data.Temperature" 
            } 
        });
        aggregation.push({ $match : { _id: new mongoose.Types.ObjectId(dataId) } });
        
        const gatewayData = await GatewayData.aggregate(aggregation);

        if(!gatewayData.length)
        {
            var msg = "No data found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data retrieved (0 records) \x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data retrieved (1 records) \x1b[0m");
            res.send(gatewayData);
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError retrieving data \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.store = async (req, res, next) => {
    try {
        //validationHandler(req);  
        var dataId = mongoose.Types.ObjectId().toHexString();
        var gwId = req.params.id;
        var data = req.body;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ") | Data(" + req.body.UtcTime + ")";
        console.log(logMessage);

        var result = await GatewayData.updateOne({
             // Filtro
            _gatewayId: gwId,
            DocDate: new Date((data.UtcTime).split('T')[0])
        },{
            //Update: Agrega elemento al array
            $push: { Data: data }
        },{
            // Si no existe el documento lo crea
            upsert: true
        });
        if(result.upserted) {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data Added (Upserted)\x1b[0m"); 
            res.send({message: "Data added (Userted)"});
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data Added\x1b[0m");
            res.send({message: "Data added"});
        }
    } catch (err) {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError adding data\x1b[35m -> " + err.message + "\x1b[0m");
            next(err);
    }
};

exports.destroy = async (req, res, next) => {
    try {
        var gwId = req.params.id;
        var dataId = req.params.subid;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")" + " | Data(" + dataId + ")";
        console.log(logMessage);
        
        result = await GatewayData.updateOne(   
            { "_gatewayId": new mongoose.Types.ObjectId(gwId) },
            { $pull : { Data : {"_id": new mongoose.Types.ObjectId(dataId)} } }
        );
        if(result.nModified == 0)
        {
            var msg = "No data found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError deleting data \x1b[35m -> " + msg + "\x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data deleted \x1b[0m");
            res.send({message: "Data deleted"});
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError deleting data \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.update = async (req, res, next) => {
    try {
        //validationHandler(req);
        var gwId = req.params.id;
        var dataId = req.params.subid;
        var data = req.body;

        var logMessage = "\x1b[34mApi: " + req.method + "(" + req.originalUrl + ")";
        logMessage = logMessage + " | Gateway(" + gwId + ")" + " | Data(" + dataId + ")";
        console.log(logMessage);

        data["_id"] = dataId; // Evita que genere un nuevo id al reemplazar los datos

        result = await GatewayData.updateOne(
            { 
                "_gatewayId": new mongoose.Types.ObjectId(gwId),
                "Data._id": new mongoose.Types.ObjectId(dataId)
            },
            { $set : {  Data: data }}
        );
        if(result.nModified == 0)
        {
            var msg = "No data found";
            next({
                statusCode: 404,
                message: msg
            });
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError updating data \x1b[35m -> " + msg + "\x1b[0m");
        } else {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data updated \x1b[0m");
            res.send({message: "Data updated"});
        }
    } catch (err) {
        next(err);
        console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError updating data \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

exports.saveData = async (gwId, data) => {    
    try {
        var result = await GatewayData.updateOne({
             // Filtro
            _gatewayId: gwId,
            DocDate: new Date((data.UtcTime).split('T')[0])
        },{
            //Update: Agrega elemento al array
            $push: { Data: data }
        },{
            // Si no existe el documento lo crea
            upsert: true
        });
        if(result.upserted)
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + data.UtcTime + ") Added (Upserted)\x1b[0m"); 
        else
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | Data(" + data.UtcTime + ") Added\x1b[0m");
    } catch (err) {
            console.log("\x1b[35mDatabase: Gateway(" + gwId + ") | \x1b[31mError adding Data(" + data.UtcTime + ") \x1b[35m -> " + err.message + "\x1b[0m");
    }
};

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
};


