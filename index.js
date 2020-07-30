const listenPort = 8000;

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorHandler = require("./middleware/errorHandler");
const gatewayRoutes = require('./routes/gatewayRoute');

const iotHubEventConsumer = require('./consumers/iotHubEventConsumer');
const config = require('./config');

/*
mongoose.connect('mongodb://localhost/IotMonitoring', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => console.log('Connection to local MongoDB successful')).catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});*/

mongoose.connect("mongodb://"+config.cosmoDb.Host+":"+config.cosmoDb.Port+"/"+config.cosmoDb.DbName+"?ssl=true&replicaSet=globaldb", {
  auth: {
    user: config.cosmoDb.User,
    password: config.cosmoDb.Password
  },
useNewUrlParser: true,
useUnifiedTopology: true,
retryWrites: false
})
.then(() => console.log('Connection to CosmosDB successful'))
.catch((err) => console.error(err));

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/gateway", gatewayRoutes);

app.use(errorHandler);

iotHubEventConsumer.suscribe();

// Start Server
app.listen(listenPort, () => {
    console.log("IoT Server iniciado (Puerto " + listenPort + ").");
})