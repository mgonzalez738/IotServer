const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

var GatewayDataSchema = new Schema({
    _gatewayId : { type: mongoose.Schema.Types.ObjectId, required : true },
    DocDate: { type: Date, required : true},
    Data: [{
        UtcTime: { type: Date, required : true},
        PowerVoltage: { type: Number, required : true },
        SensedVoltage: { type: Number, required : true },
        BatteryVoltage: { type: Number, required : true },
        Temperature: { type: Number, required : true }
    }],
});

module.exports = mongoose.model("gatewayData", GatewayDataSchema);