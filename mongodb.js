
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://komaru123:Hyderabad007@cluster0.g4a2w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
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
