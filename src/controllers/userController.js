const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/userModel");
const validator = require('../middleware/validation');
const aws = require('../aws/aws')
const validUrl = require('valid-url');


//================================Create User Api (register)========================================


const createUser = async function (req, res) {
    try {
        let body = JSON.parse(JSON.stringify(req.body))

        //Validate body 
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }

        let { fname, lname, email, password, phone, address } = body

        // Validate fname
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname must be present" })
        }

        // Validation of fname
        if (!validator.isValidName(fname)) {
            return res.status(400).send({ status: false, msg: "Invalid fname" })
        }

        // Validate lname
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname must be present" })
        }

        // Validation of lname
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }

        // Validate email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email must be present" })
        }

        // Validation of email id
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email id" })
        }

        // Validate password
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password must be present" })
        }

        // Validation of password
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password" })
        }

        // Validate phone
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone must be present" })
        }

        // Validation of phone number
        if (!validator.isValidNumber(phone)) {
            return res.status(400).send({ status: false, msg: "Invalid phone number" })
        }

        // Validate address
        if (!address) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }
        address = JSON.parse(address)
        if (typeof address != "object") {

            return res.status(400).send({ status: false, message: "address should be an object" })
        }
        // address = JSON.parse(address)
        // Validate shipping address
        if (!address.shipping) {
            return res.status(400).send({ status: false, message: "Shipping address is required" })
        }
        if (typeof address.shipping != "object") {
            return res.status(400).send({ status: false, message: "shipping should be an object" })
        }

        // Validate street, city, pincode of shipping
        if (!validator.isValid(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping address details is/are missing" })
        }

        // Validate shipping pincode
        if (!validator.isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
        }

        // Validate billing address
        if (!validator.isValid(address.billing)) {
            return res.status(400).send({ status: false, message: "Billing address is required" })
        }

        // Validate street, city, pincode of billing
        if (typeof address.billing != "object") {
            return res.status(400).send({ status: false, message: "billing should be an object" })
        }
        if (!validator.isValid(address.billing.street && address.billing.city && address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing address details is/are missing" })
        }


        // Validate billing pincode
        if (!validator.isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
        }


        // Duplicate entries
        email = email.toLowerCase().trim()
        let isAlredyUsed = await UserModel.findOne({ email });
        if (isAlredyUsed) {
            return res.status(400).send({ status: false, message: ` ${email} mail is already registered` })
        }

        let duplicatePhone = await UserModel.findOne({ phone });
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: `${phone} phone is already used` })
        }

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            if (!validUrl.isUri(uploadedFileURL)) {
                return res.status(400).send({ status: false, msg: 'invalid uploadFileUrl' })
            }
            // encrypted password
            let encryptPassword = await bcrypt.hash(password, 12)

            profileImage = uploadedFileURL
            body.address = JSON.parse(body.address)
            let userData = { fname, lname, email, profileImage, phone, password: encryptPassword, address }

            let savedData = await UserModel.create(userData)
            return res.status(201).send({ status: true, message: "User created successfully", data: savedData })
        }
        else {
            return res.status(400).send({ status: false, msg: "No file found" });
        }

    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//===================================Login User Api (login)==================================================

const login = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, message: "Plz Enter Email & Password In Body !!!" });
        }
        if (Object.keys(data).length >= 3) {
            return res.status(400).send({ status: false, message: "Only Enter Email & Password In Body !!!" });
        }


        const email = req.body.email;
        if (!email) {
            return res.status(400).send({ status: false, message: "Plz Enter Email In Body !!!" });
        }
        const findData = await UserModel.findOne({ email }).select({ email: 1, password: 1 });
        if (!findData) {
            return res.status(400).send({ status: false, message: "Plz Enter Valid Email-Id !!!" });
        }


        const password = req.body.password;
        if (!password) {
            return res.status(400).send({ status: false, message: "Plz Enter Password In Body !!!" });
        }
        const match = await bcrypt.compare(password, findData.password);
        if (!match) {
            return res.status(400).send({ status: false, message: "Plz Enter Valid Password !!!" });
        }


        const userId = findData._id;
        const token = jwt.sign({
            userId: userId
        },
            "GroupNo14", { expiresIn: "24H" }
        );

        res.status(200).send({
            status: true,
            message: "User login successfull",
            data: { userId: userId, token: token }
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};

//==========================Get User Api (user/:userId/profile)=======================================

const getUser = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId

        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "invalid userId" })
        }

        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "Unauthorized User" })
        }

        let checkData = await UserModel.findOne({ _id: userId })

        if (!checkData) {
            return res.status(404).send({ status: false, message: "User not Found" })
        }

        return res.status(200).send({ status: true, message: "Success", data: checkData })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};

//=========================Update User Api (user/:userId/profile)===================================


const update = async function (req, res) {
    try {
        // Validate body
        const body = req.body
        // const reqBody = JSON.parse(req.body.data)
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Details must be present to update" })
        }

        // Validate params
        userId = req.params.userId
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: `${userId} is invalid` })
        }

        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, msg: "User does not exist" })
        }


        // AUTHORISATION
        if (userId !== req['userId']) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        // Destructuring
        let { fname, lname, email, phone, password, address, profileImage } = body;


        let updatedData = {}
        if (validator.isValid(fname)) {
            if (!validator.isValidName(fname)) {
                return res.status(400).send({ status: false, msg: "Invalid fname" })
            }
            updatedData['fname'] = fname
        }
        if (validator.isValid(lname)) {
            if (!validator.isValidName(lname)) {
                return res.status(400).send({ status: false, msg: "Invalid lname" })
            }
            updatedData['lname'] = lname
        }

        // Updating of email
        if (validator.isValid(email)) {
            if (!validator.isValidEmail(email)) {
                return res.status(400).send({ status: false, msg: "Invalid email id" })
            }


            // Duplicate email
            const duplicatemail = await UserModel.findOne({ email: email })
            if (duplicatemail.length) {
                return res.status(400).send({ status: false, msg: "email id already exist" })
            }
            updatedData['email'] = email
        }

        // Updating of phone
        if (validator.isValid(phone)) {
            if (!validator.isValidNumber(phone)) {
                return res.status(400).send({ status: false, msg: "Invalid phone number" })
            }

            // Duplicate phone
            const duplicatePhone = await UserModel.findOne({ phone: phone })
            if (duplicatePhone.length) {
                return res.status(400).send({ status: false, msg: "phone number already exist" })
            }
            updatedData['phone'] = phone
        }

        // Updating of password
        if (password) {
            if (!validator.isValid(password)) {
                return res.status(400).send({ status: false, message: 'password is required' })
            }
            if (!validator.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
            }
            const encrypt = await bcrypt.hash(password, 10)
            updatedData['password'] = encrypt
        }

        // Updating address
        if (address) {
            address = JSON.parse(address)
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!validator.isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    updatedData['address.shipping.street'] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!validator.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    updatedData['address.shipping.city'] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode' })
                    }
                    // Validate shipping pincode
                    if (!validator.isValidPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
                    }
                    updatedData['address.shipping.pincode'] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!validator.isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    updatedData['address.billing.street'] = address.billing.street
                }
                if (address.billing.city) {
                    if (!validator.isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    updatedData['address.billing.city'] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode' })
                    }
                    // Validate billing pincode
                    if (!validator.isValidPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
                    }
                    updatedData['address.billing.pincode'] = address.billing.pincode
                }
            }
        }

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            if (!validUrl.isUri(uploadedFileURL)) {
                return res.status(400).send({ status: false, msg: 'invalid uploadFileUrl' })
            }
            if (uploadedFileURL) {
                updatedData['profileImage'] = uploadedFileURL
            }
        }

        //body.address = JSON.parse(body.address)
        const updated = await UserModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
        return res.status(200).send({ status: true, data: updated })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
};



module.exports = { createUser, login, getUser, update };



//========================================End=================================================