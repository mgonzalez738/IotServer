const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

var GatewayDataSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    _gatewayId : { type: mongoose.Schema.Types.ObjectId },
    Data: {
        UtcTime: { type: Date, required : true, unique: true},
        PowerVoltage: { type: Number, required : true },
        SensedVoltage: { type: Number, required : true },
        BatteryVoltage: { type: Number, required : true },
        Temperature: { type: Number, required : true }
    },
});

module.exports = mongoose.model("gatewayData", GatewayDataSchema);