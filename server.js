const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require('body-parser');
const os = require('os');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const config = require('./config/config');

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(8000, () => {
    console.log('Example app listening on port 8000!')
});

mongoose.Promise = global.Promise;
// set the global useNewUrlParser option to turn on useNewUrlParser for every connection by default.
mongoose.set('useNewUrlParser', true);
// indexes for Mongoose schemas
mongoose.set('useCreateIndex', true);
// mongoose debug mode, by default false
mongoose.set('debug', true);
// connecting to db
// mongoose.connect(config.MONGO_URI, { useNewUrlParser: true });
// handle connected event
mongoose.connection.on('connected', () => {
    console.info('Mongoose connected to : ' + config.MONGO_URI);
});
// handle error event
mongoose.connection.on('error', (err) => {
    console.error(err);
    process.exit(0);
});

// handle disconnected event
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected.');
});

// handle application termination event
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.info('MongoDB disconnected through application termination.');
        process.exit(0);
    });
});

app.set('case sensitive routing', true);
app.set('env', config.NODE_ENV);
app.set('port', config.PORT);

const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
// if (app.get('env') === 'production') {
//     swaggerDocument.host = config.SWAGGER_URL;
// }
// else {
swaggerDocument.host = `${os.hostname()}:${config.PORT}`;
// }

let swagOptions = {
    explorer: false,
    customCss: '.swagger-ui .topbar { display: none }'
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swagOptions));

app.use(cors());

app.use(function (req, res) {
    return res.status(404).send({ success: false, msg: 'API not found', data: req.originalUrl + ' not found' })
});

// this route is only for upload file testing using html code use uploadImage api to upload file
app.get('/upload', function (req, res) {
    res.sendFile(__dirname + '/partials/index.html');
});

if (config.CLUSTERING) {
    startServer()
} else {
    startServer()
}

function startServer() {
    app.listen(app.get('port'), function () {
        console.log(`Server is listening on http://${os.hostname()}:${app.get('port')}`);
    });
}

app.use(function (err, req, res, next) {
    return res.status(500).send({ success: false, msg: 'Internal Server Error', data: (app.get('env') === 'production') ? {} : err.stack });
});

module.exports = app;