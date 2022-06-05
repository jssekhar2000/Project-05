const mongoose = require("mongoose");
const productModel = require("../Models/productModel");



//this validation will check the type of values--
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};
//this validbody checks the validation for the empty body
const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
//checks wheather object id is valid or not
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
};
//checs valid type of email--
const isValidEmail = function (value) {

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return false
    }
    return true
};
//checks valid type of number
const isValidNumber = function (value) {

    if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(value))) {

        return false
    }
    return true
};
//valid type of name
const isValidName = function (value) {
    if (!(/^[A-Za-z ]+$/.test(value.trim()))) {
        return false
    }
    return true
};
//
const isValidPassword = function (value) {
    if (!(/^[a-zA-Z0-9'@&#.\s]{8,15}$/.test(value))) {
        return false
    }
    return true
};
//
const isValidPincode = function (value) {
    if (!(/^\d{6}$/.test(value))) {
        return false
    }
    return true
};
//
const isValidPrice = function (value) {
    if (!/^\d+(,\d{3})*(\.\d{1,2})?$/.test(value)) {
        return false
    }
    return true
};
//
const isValidSize = function (value) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) !== -1
};


//=========================Post Product Validation=====================================================



const validProduct = async function (req, res, next) {
    try {
        let body = JSON.parse(JSON.stringify(req.body));
        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, msg: "Plz Enter Data Inside Body !!!" });
        }

        const { title, description, price, currencyId, currencyFormat, availableSizes, installments } = body;

        if (!title) {
            return res.status(400).send({ status: false, msg: "Plz Enter title In Body !!!" });
        }

        if (!isValidName(title)) {
            return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
        }

        const findTitle = await productModel.findOne({ title: title });
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "Title Is Already Exists, Plz Enter Another One !!!" });
        }

        if (!description) {
            return res.status(400).send({ status: false, msg: "Plz Enter description In Body !!!" });
        }

        if (!price) {
            return res.status(400).send({ status: false, msg: "Plz Enter price In Body !!!" });
        }
        if (!isValidPrice(price)) {
            return res.status(400).send({ status: false, msg: "Plz Enter valid format price In Body !!!" });
        }

        if (!currencyId) {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyId In Body !!!" });
        }
        if (currencyId != 'INR') {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyID in INR format !!!" });
        }
        if (!currencyFormat) {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyFormat In Body !!!" });
        }

        if (currencyFormat != '₹') {
            return res.status(400).send({ status: false, msg: "Plz Use Indian Currency Format(₹) In Body !!!" });
        }

        if (!availableSizes) {
            return res.status(400).send({ status: false, msg: "Plz Enter availableSizes In Body !!!" });
        }

        if (isNaN(installments) == true) {
            return res.status(400).send({ status: false, msg: "Plz Enter Number In installments !!!" });
        }

        let files = req.files;
        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, msg: "Enter File In Body !!!" });
        }
        next();
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};



module.exports = { isValid, isValidBody, isValidObjectId, isValidEmail, isValidNumber, isValidName, isValidPassword, isValidPincode, isValidPrice, isValidSize, validProduct };