const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const randomString = (length) => {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
var password = randomString(32);
const generateNewSession = () => {
  password = randomString(32);
};

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = {
  generateNewSession: generateNewSession,
  encrypt: encrypt,
  decrypt: decrypt,
};
