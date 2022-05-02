var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var client = require("../mongodb");
const bcryptjs = require("bcryptjs");
const { request } = require("express");
const helper = require("../helper.js");
// const { encrypt, decrypt } = require("../helper.js");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/test", function (req, res) {
  res.status(200).send("api is working");
});

router.get("/invalidatesession", (req, res) => {
  helper.generateNewSession();
  res.status(200).send(helper.generateNewSession());
});

router.post("/addHospital", function (req, res) {
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const insertResult = await collection.insertOne({
      hospitalName: req.body.hospitalName.trim(),
      phoneNumber: req.body.phoneNumber.trim(),
      address: req.body.address.trim(),
      city: req.body.city.toUpperCase().trim(),
      state: req.body.state.toUpperCase().trim(),
    });
    res.status(200).send(insertResult);
    client.close();
  });
});

router.post("/encrypt/addHospital", function (request, res) {
  const req = JSON.parse(helper.decrypt(request.body.decryptthis));
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const insertResult = await collection.insertOne({
      hospitalName: req.hospitalName.trim(),
      phoneNumber: req.phoneNumber.trim(),
      address: req.address.trim(),
      city: req.city.toUpperCase().trim(),
      state: req.state.toUpperCase().trim(),
    });
    res.status(200).send(insertResult);
    client.close();
  });
});

router.get("/fetchAllHospitals", function (req, res) {
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/fetchAllHospitals", function (req, res) {
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/getNearByHospitals", function (req, res) {
  client.connect(async (err) => {
    const user_collection = client.db("community").collection("user_details");
    const city = await user_collection
      .find({ email: req.query.email }, { projection: { city: 1 } })
      .toArray();
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection.find({ city: city[0].city }).toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getNearByHospitals", function (req, res) {
  client.connect(async (err) => {
    const user_collection = client.db("community").collection("user_details");
    const city = await user_collection
      .find({ email: req.query.email }, { projection: { city: 1 } })
      .toArray();
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection.find({ city: city[0].city }).toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/fetchHospitalByCity", function (req, res) {
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection
      .find(
        { city: req.query.city.toUpperCase().trim() },
        { projection: { _id: 0 } }
      )
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/fetchHospitalByCity", function (req, res) {
  client.connect(async (err) => {
    const collection = client
      .db("community")
      .collection("hospital_information");
    const findResult = await collection
      .find(
        { city: req.query.city.toUpperCase().trim() },
        { projection: { _id: 0 } }
      )
      .toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.post("/addUser", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    var role = req.body.role;
    const insertResult = await collection.insertOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: bcryptjs.hashSync(req.body.password, 8),
      age: req.body.age,
      gender: req.body.gender,
      community: req.body.community,
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city.toUpperCase().trim(),
      state: req.body.state.toUpperCase().trim(),
      addressProofs: {
        drivingLicense: req.body.addressProofID.drivingLicense,
        stateId: req.body.addressProofID.stateId,
        passport: req.body.addressProofID.passport,
      },
      phone: req.body.phone,
      role: req.body.role,
    });
    res.status(200).send(insertResult);

    if (role == "user") {
      const patient_collection = client
        .db("community")
        .collection("patient_details");
      const patientInsertResult = await patient_collection.insertOne({
        patientEmail: req.body.email,
        vaccinationHistory: {
          vaccine_name: null,
          first_shot_on: null,
          second_shot_on: null,
        },
        covid_affected: null,
        affected_on: null,
        covid_recovered: null,
        recovered_on: null,
        qurantine_start_date: null,
        qurantine_end_date: null,
        undergoing_treatment: null,
        doctor_details: [
          {
            doctorEmail: null,
            visits: [
              {
                consultation_date: null,
                symptoms: [],
                oxygen_level: null,
                followup_date: null,
                medicines: [
                  {
                    name: null,
                    timimgs: null,
                    course_duration: null,
                  },
                ],
              },
            ],
          },
        ],
      });
      console.log("Added patient entry");
    }

    if (role == "doctor") {
      const doctor_collection = client
        .db("community")
        .collection("doctor_consultation");
      const doctorInsertResult = await doctor_collection.insertOne({
        doctorEmail: req.body.email,
        patients: [
          {
            patientEmail: null,
            visits: [
              {
                consultation_date: null,
                symptoms: [],
                oxygen_level: null,
                followup_date: null,
                medicines: [
                  {
                    name: null,
                    course_duration: null,
                  },
                ],
              },
            ],
          },
        ],
      });
      console.log("Added doctor entry");
    }

    client.close();
  });
});

router.post("/encrypt/addUser", function (request, res) {
  const req = JSON.parse(helper.decrypt(request.body.decryptthis));
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    var role = req.role;
    const insertResult = await collection.insertOne({
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      password: bcryptjs.hashSync(req.password, 8),
      age: req.age,
      gender: req.gender,
      community: req.community,
      address_1: req.address_1,
      address_2: req.address_2,
      city: req.city.toUpperCase().trim(),
      state: req.state.toUpperCase().trim(),
      addressProofs: {
        drivingLicense: req.addressProofID.drivingLicense,
        stateId: req.addressProofID.stateId,
        passport: req.addressProofID.passport,
      },
      phone: req.phone,
      role: req.role,
    });
    res.status(200).send(insertResult);

    if (role == "user") {
      const patient_collection = client
        .db("community")
        .collection("patient_details");
      const patientInsertResult = await patient_collection.insertOne({
        patientEmail: req.email,
        vaccinationHistory: {
          vaccine_name: null,
          first_shot_on: null,
          second_shot_on: null,
        },
        covid_affected: null,
        affected_on: null,
        covid_recovered: null,
        recovered_on: null,
        qurantine_start_date: null,
        qurantine_end_date: null,
        undergoing_treatment: null,
        doctor_details: [
          {
            doctorEmail: null,
            visits: [
              {
                consultation_date: null,
                symptoms: [],
                oxygen_level: null,
                followup_date: null,
                medicines: [
                  {
                    name: null,
                    timimgs: null,
                    course_duration: null,
                  },
                ],
              },
            ],
          },
        ],
      });
      console.log("Added patient entry");
    }

    if (role == "doctor") {
      const doctor_collection = client
        .db("community")
        .collection("doctor_consultation");
      const doctorInsertResult = await doctor_collection.insertOne({
        doctorEmail: req.email,
        patients: [
          {
            patientEmail: null,
            visits: [
              {
                consultation_date: null,
                symptoms: [],
                oxygen_level: null,
                followup_date: null,
                medicines: [
                  {
                    name: null,
                    course_duration: null,
                  },
                ],
              },
            ],
          },
        ],
      });
      console.log("Added doctor entry");
    }

    client.close();
  });
});

router.get("/fetchUserById", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection.findOne(
      { email: req.query.email },
      { projection: { password: 0, role: 0 } }
    );
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/fetchUserById", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection.findOne(
      { email: req.query.email },
      { projection: { password: 0, role: 0 } }
    );
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/getRole", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection.findOne(
      { email: req.query.email },
      { projection: { role: 1, _id: 0 } }
    );
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getRole", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection.findOne(
      { email: req.query.email },
      { projection: { role: 1, _id: 0 } }
    );
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.post("/updatePassword", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const updateResult = await collection.updateOne(
      { email: req.body.email },
      {
        $set: { password: bcryptjs.hashSync(req.body.updateValue.password, 8) },
      }
    );
    const findResult = await collection.findOne(
      { email: req.body.email },
      { projection: { _id: 0, email: 1, password: 1 } }
    );
    res.status(200).send(findResult);
    client.close();
  });
});

router.post("/encrypt/updatePassword", function (request, res) {
  const req = JSON.parse(helper.decrypt(request.body.decryptthis));
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const updateResult = await collection.updateOne(
      { email: req.email },
      {
        $set: { password: bcryptjs.hashSync(req.updateValue.password, 8) },
      }
    );
    const findResult = await collection.findOne(
      { email: req.email },
      { projection: { _id: 0, email: 1, password: 1 } }
    );
    res.status(200).send(findResult);
    client.close();
  });
});

router.post("/updateUserDetails", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const update_values = req.body.updateValue;
    delete update_values["password"];
    const updateResult = await collection.updateOne(
      { email: req.body.email },
      { $set: update_values }
    );
    const findResult = await collection
      .find({}, { projection: { _id: 0, password: 0 } })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.post("/encrypt/updateUserDetails", function (request, res) {
  const req = JSON.parse(helper.decrypt(request.body.decryptthis));
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const update_values = req.updateValue;
    delete update_values["password"];
    const updateResult = await collection.updateOne(
      { email: req.email },
      { $set: update_values }
    );
    const findResult = await collection
      .find({}, { projection: { _id: 0, password: 0 } })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.post("/addCovidInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const insertResult = await collection.updateOne(
      { patientEmail: req.body.patientEmail },
      { $set: req.body.covid_info }
    );
    res.status(200).send(insertResult);
    client.close();
  });
});

router.post("/encrypt/addCovidInfo", function (request, res) {
  const req = JSON.parse(helper.decrypt(request.body.decryptthis));
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const insertResult = await collection.updateOne(
      { patientEmail: req.patientEmail },
      { $set: req.covid_info }
    );
    res.status(200).send(insertResult);
    client.close();
  });
});

router.get("/getPatientInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const findResult = await collection
      .find({ patientEmail: req.query.patientEmail })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getPatientInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const findResult = await collection
      .find({ patientEmail: req.query.patientEmail })
      .toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/getDoctorInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("doctor_consultation");
    const findResult = await collection
      .find({ doctorEmail: req.query.doctorEmail })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getDoctorInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("doctor_consultation");
    const findResult = await collection
      .find({ doctorEmail: req.query.doctorEmail })
      .toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.post("/addConsultation", function (req, res) {
  client.connect(async (err) => {
    const patient_collection = client
      .db("community")
      .collection("patient_details");
    const doctor_collection = client
      .db("community")
      .collection("doctor_consultation");
    var doctor_email = req.body.doctorEmail;
    var patient_email = req.body.patientEmail;

    const patient_details = await patient_collection.findOne({
      patientEmail: patient_email,
    });
    patient_details.undergoing_treatment = true;
    const doctor_details = await doctor_collection.findOne({
      doctorEmail: doctor_email,
    });
    var doctor_available = false;
    var patient_available = false;

    // Update doctor details object
    doctor_details.patients.forEach((element) => {
      // console.log(element.patientEmail);
      if (element.patientEmail === patient_email) {
        patient_available = true;
        element.visits.push(req.body.visit);
      }
    });
    if (!patient_available) {
      doctor_details.patients.push({
        patientEmail: patient_email,
        visits: [req.body.visit],
      });
    }

    // Update patient details object
    patient_details.doctor_details.forEach((element) => {
      if (element.doctorEmail === doctor_email) {
        doctor_available = true;
        element.visits.push(req.body.visit);
      }
    });
    if (!doctor_available) {
      patient_details.doctor_details.push({
        doctorEmail: doctor_email,
        visits: [req.body.visit],
      });
    }

    await patient_collection.updateOne(
      { patientEmail: patient_email },
      { $set: patient_details }
    );

    await doctor_collection.updateOne(
      { doctorEmail: doctor_email },
      { $set: doctor_details }
    );

    res.status(200).send("Updated the consultation information");
    client.close();
  });
});

router.post("/encrypt/addConsultation", function (request, res) {

  const req = JSON.parse(helper.decrypt(request.body.decryptthis));

  client.connect(async (err) => {
    const patient_collection = client
      .db("community")
      .collection("patient_details");
    const doctor_collection = client
      .db("community")
      .collection("doctor_consultation");
    var doctor_email = req.doctorEmail;
    var patient_email = req.patientEmail;

    const patient_details = await patient_collection.findOne({
      patientEmail: patient_email,
    });
    patient_details.undergoing_treatment = true;
    const doctor_details = await doctor_collection.findOne({
      doctorEmail: doctor_email,
    });
    var doctor_available = false;
    var patient_available = false;

    // Update doctor details object
    doctor_details.patients.forEach((element) => {
      // console.log(element.patientEmail);
      if (element.patientEmail === patient_email) {
        patient_available = true;
        element.visits.push(req.visit);
      }
    });
    if (!patient_available) {
      doctor_details.patients.push({
        patientEmail: patient_email,
        visits: [req.visit],
      });
    }

    // Update patient details object
    patient_details.doctor_details.forEach((element) => {
      if (element.doctorEmail === doctor_email) {
        doctor_available = true;
        element.visits.push(req.visit);
      }
    });
    if (!doctor_available) {
      patient_details.doctor_details.push({
        doctorEmail: doctor_email,
        visits: [req.visit],
      });
    }

    await patient_collection.updateOne(
      { patientEmail: patient_email },
      { $set: patient_details }
    );

    await doctor_collection.updateOne(
      { doctorEmail: doctor_email },
      { $set: doctor_details }
    );

    res.status(200).send("Updated the consultation information");
    client.close();
  });
});

router.get("/fetchAllUsers", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/fetchAllUsers", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("user_details");
    const findResult = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/getAllPatientsInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const findResult = await collection.find({}).toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getAllPatientsInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("patient_details");
    const findResult = await collection.find({}).toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.get("/getAllDoctorsInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("doctor_consultation");
    const findResult = await collection.find({}).toArray();
    res.status(200).send(findResult);
    client.close();
  });
});

router.get("/encrypt/getAllDoctorsInfo", function (req, res) {
  client.connect(async (err) => {
    const collection = client.db("community").collection("doctor_consultation");
    const findResult = await collection.find({}).toArray();
    res.status(200).send(helper.encrypt(JSON.stringify(findResult)));
    client.close();
  });
});

router.post("/encrypt", (req, res) => {
  res.status(200).send(helper.encrypt(JSON.stringify(req.body.encryptthis)));
});

router.post("/decrypt", (req, res) => {
  res.status(200).send(JSON.parse(helper.decrypt(req.body.decryptthis)));
});

module.exports = router;
