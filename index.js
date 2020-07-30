const listenPort = 8000;

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorHandler = require("./middleware/errorHandler");
const gatewayRoutes = require('./routes/gatewayRoute');

const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/IotMonitoring', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => console.log('DB Connected!')).catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(errorHandler);

app.use("/api/gateway", gatewayRoutes);

iotHubEventConsumer.suscribe();

// Start Server
app.listen(listenPort, () => {
    console.log("IoT Server iniciado (Puerto " + listenPort + ").");
})