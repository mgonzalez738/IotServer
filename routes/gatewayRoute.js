const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const gatewayDataController = require('../controllers/gatewayDataController');

// Gateways
router.get('/', gatewayController.index);
router.get('/:id', gatewayController.show);
router.post('/', gatewayController.store);
router.delete('/:id', gatewayController.delete);

// Datos Gateway
router.get('/:id/data/', gatewayDataController.index);
router.post('/:id/data/', gatewayDataController.store);

module.exports = router;