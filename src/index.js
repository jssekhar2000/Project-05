const express = require("express")
const bodyParser = require("body-parser")
const route = require("./routes/route")
const mongoose = require("mongoose")
const app = express();
const multer = require("multer");
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())

mongoose.connect("mongodb+srv://swati_pathak:DGhDxlBIIfyRwGwk@cluster0.ogdpf.mongodb.net/group-14Database", {
    useNewUrlParser: true
}).then(() => console.log("MongoDB Is Connected !!!")).catch(err => console.log(err))

app.use('/', route);

app.all('*', function (req, res) {
    throw new Error("You Hit Wrong Api!!!, Plz Check !!!")
});

app.use(function (e, req, res, next) {
    if (e.message === "You Hit Wrong Api!!!, Plz Check !!!") {
        res.status(400).send({ status: false, error: e.message });
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});