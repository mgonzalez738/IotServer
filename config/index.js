module.exports = {
    iotHub: {
        HostName: "MonitoringHub.azure-devices.net",
        SharedAccessKeyName: "iothubowner",
        SharedAccessKey: "aOFsWnGlHYPBUyO+J4QJtrq7zXITgnxlHuOewLiyTpU=",
        EventEndpoint: "Endpoint=sb://ihsuprodbyres035dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=aOFsWnGlHYPBUyO+J4QJtrq7zXITgnxlHuOewLiyTpU=;EntityPath=iothub-ehub-monitoring-2971940-4fcc68444d",
        EventConsumerGroup: "iotmonitoringbackend"
    },
    cosmoDb: {
        User: "iotmonitoring",
        Password: "z9BrDHIGImC3AjnhZnSkZed5qCxmiOW5wBlXzBL5noOdmPj4E76MJ4udGRHomuifK2sT97kw07AIbn8UkcSiPQ==",
        DbName: "IotMonitoring",
        Host: "iotmonitoring.mongo.cosmos.azure.com",
        Port: 10255
    }
};