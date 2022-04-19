var express = require('express');
var app = express();
var mongodb = require('./mongodb.js');

global.__root = __dirname + '/';


var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var screeingController = require(__root + 'screening/ScreeningController');
app.use('/api', screeingController);

var server = require('http').Server(app);

module.exports = server ;