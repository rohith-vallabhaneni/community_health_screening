var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/user.js');

const tokenList = {};

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../../config'); // get config file

router.post('/login', function (req, res) {
  User.findOne({ Primary: req.body.primary }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.Password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ user: user._id }, config.secret, { expiresIn: config.tokenExpiry });

    const refreshToken = jwt.sign({ user: user._id }, config.refreshSecret, { expiresIn: config.refreshExpiry });

    const response = {
      'token': token,
      'refreshToken': refreshToken,
      'ExpiresIn': config.tokenExpiry
    }

    tokenList[refreshToken] = response;

    // return the information including token as JSON
    res.status(200).send(response);
  });
});

router.post('/token', (req, res) => {
  // refresh the token
  const postData = req.body;
  // if refresh token exists
  if ((postData.refreshToken) && (postData.refreshToken in tokenList)) {

    jwt.verify(postData.refreshToken, config.refreshSecret, function (err, decoded) {
      if (err)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

      // if everything is good, save to request for use in other routes
      req.userId = decoded.user;

      User.findOne({ _id: req.userId }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        const token = jwt.sign({ user: user._id }, config.secret, { expiresIn: config.tokenExpiry });
        const refreshToken = jwt.sign({ user: user._id }, config.refreshSecret, { expiresIn: config.refreshExpiry });

        const response = {
          "token": token,
          "refreshToken": refreshToken,
          'ExpiresIn': config.tokenExpiry
        };

        // update the token in the list
        delete tokenList[postData.refreshToken];
        tokenList[refreshToken] = response;

        res.status(200).json(response);
      });
    });
  }
  else {
    res.status(404).send('Invalid request')
  }
});

router.post('/expiry', (req, res) => {
  // refresh the token
  const postData = req.body;
  // if refresh token exists
  if ((postData.token)) {

    jwt.verify(postData.token, config.secret, function (err, decoded) {
      if (err)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

      // if everything is good, save to request for use in other routes
      req.userId = decoded.user;

      User.findOne({ _id: req.userId }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        res.status(200).send("true");
      });
    });
  }
  else {
    res.status(404).send('Invalid request')
  }
});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
    UserName: req.body.username.toLowerCase(),
    FirstName: req.body.firstname.toLowerCase(),
    LastName: req.body.lastname.toLowerCase(),
    PhoneNumber: req.body.phonenumber,
    JoinedAt: new Date(),
    Email: req.body.email.toLowerCase(),
    Password: hashedPassword,
    Primary: req.body.primary
  },
    function (err, user) {
      if (err) {
        console.log(err);
        return res.status(500).send("There was a problem registering the user.");
      }

      // if user is registered without errors
      // create a token
      var token = jwt.sign({ user: user._id }, config.secret, { expiresIn: 86400 });

      res.status(200).send({ auth: true, token: token });
    });
});

router.get('/me', VerifyToken, function (req, res, next) {

  User.findById(req.userId, { Password: 0, __v: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});

module.exports = router;