const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const gatewayDataController = require('../controllers/gatewayDataController');
const {queryFromIsISO8601, queryToIsISO8601, parameterGatewayIdIsMongoId, parameterDataIdIsMongoId, bodyIsAggregationStageArray} = require('../validations/gatewayDataValidators');
const {bodyUtcTimeIsISO8601, bodyPowerVoltageIsFloat, bodySensedVoltageIsFloat, bodyBatteryVoltageIsFloat, bodyTemperatureIsFloat} = require('../validations/gatewayDataValidators');


// Gateways

router.get('/', gatewayController.index);
router.get('/:id', gatewayController.show);
router.post('/', gatewayController.store);
router.delete('/:id', gatewayController.destroy);

// Datos Gateway

router.get(
    '/:gwId/data/',
    [
        parameterGatewayIdIsMongoId,
        queryFromIsISO8601,
        queryToIsISO8601,
        bodyIsAggregationStageArray
    ], 
    gatewayDataController.index
);

router.get(
    '/:gwId/data/:dataId',
    [
        parameterGatewayIdIsMongoId,
        parameterDataIdIsMongoId
    ],
    gatewayDataController.show
);

router.post(
    '/:gwId/data/', 
    [
        parameterGatewayIdIsMongoId,
        bodyUtcTimeIsISO8601,
        bodyPowerVoltageIsFloat,
        bodySensedVoltageIsFloat,
        bodyBatteryVoltageIsFloat,
        bodyTemperatureIsFloat
    ],
    gatewayDataController.store
);

router.delete(
    '/:gwId/data/:dataId', 
    [
        parameterGatewayIdIsMongoId,
        parameterDataIdIsMongoId
    ],
    gatewayDataController.destroy
);

router.put(
    '/:gwId/data/:dataId', 
    [
        parameterGatewayIdIsMongoId,
        parameterDataIdIsMongoId,
        bodyUtcTimeIsISO8601,
        bodyPowerVoltageIsFloat,
        bodySensedVoltageIsFloat,
        bodyBatteryVoltageIsFloat,
        bodyTemperatureIsFloat
    ],
    gatewayDataController.update
);

module.exports = router;