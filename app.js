var express = require('express');
const cors = require('cors');
var app = express();
app.use(cors({
    origin: '*'
}));
var mongodb = require('./mongodb.js');

global.__root = __dirname + '/';


var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var screeingController = require(__root + 'screening/ScreeningController');
app.use('/api', screeingController);

var server = require('http').Server(app);

module.exports = server ;