
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://root:root@localhost:27017';
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err, client) => {
  if (err) {
      return console.log(err);
  }

  console.log(`MongoDB Connected: ${url}`);
});

module.exports = client;
