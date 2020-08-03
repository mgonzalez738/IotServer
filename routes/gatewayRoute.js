const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const gatewayDataController = require('../controllers/gatewayDataController');

// Gateways
router.get('/', gatewayController.index);
router.get('/:id', gatewayController.show);
router.post('/', gatewayController.store);
router.delete('/:id', gatewayController.destroy);

// Datos Gateway
router.get('/:id/data/', gatewayDataController.index);
router.get('/:id/data/:subid', gatewayDataController.show);
router.post('/:id/data/', gatewayDataController.store);
router.delete('/:id/data/:subid', gatewayDataController.destroy);
router.put('/:id/data/:subid', gatewayDataController.update);

module.exports = router;