var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var client = require("../mongodb");
const bcryptjs = require("bcryptjs");
const { request, response } = require("express");
const helper = require("../helper");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/login', function (request, res) {
    const req = JSON.parse(helper.decrypt(request.body.decryptthis));
    client.connect(async (err) => {
        const collection = client.db("community").collection("user_details");
        var user = await collection.findOne({ email: req.email }, {projection: { password: 1, role:1, city:1, _id: 0 }});
        if(user != null){
            var passwordIsValid = bcryptjs.compareSync(req.password, user.password);
            if (!passwordIsValid){
                return res.status(401).send("Invalid credentials");
            } 
            else{
                var response = {
                    "email": req.email,
                    "role": user.role,
                    "city": user.city

                };
                return res.status(201).send(response);
            } 
            client.close();
        }
        else return res.status(400).send("User not exists!");
        client.close();
    });
});
module.exports = router;