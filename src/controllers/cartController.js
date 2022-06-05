const cartModel = require("../Models/cartModel");
const validator = require('../middleware/validation');
const productModel = require("../Models/productModel");
const UserModel = require("../Models/userModel");
const chalk = require("chalk");


//==============================Create Cart Api (users/:userId/cart)=============================================== 


const createCart = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId
        const data = req.body
        let { productId, quantity } = data

        //Validate body 
        if (!validator.isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide Cart details" });
        }
        if (!validator.isValid(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: 'please provide userId' })
        }
        if (!validator.isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }

        const userByuserId = await UserModel.findById(userIdFromParams);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (req['userId'] != userIdFromParams) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access.",
            });
        }

        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if (findProduct.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product is deleted" });
        }

        if (!quantity) {
            quantity = 1
        }
        if(typeof quantity!= "number"){
            return res.status(400).send({ status: false, message: 'quantity should be a valid number' })
        }

        if ((isNaN(Number(quantity)))) {
            return res.status(400).send({ status: false, message: 'quantity should be a valid number' })
        }

        if (quantity < 0) {
            return res.status(400).send({ status: false, message: 'quantity can not be less than  zero' })
        }

        const isOldUser = await cartModel.findOne({ userId: userIdFromParams });

        if (!isOldUser) {
            const newCart = {
                userId: userIdFromParams,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: (findProduct.price) * quantity,
                totalItems: 1
            }

            const createCart = await cartModel.create(newCart)
            return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
        }

        if (isOldUser) {
            const newTotalPrice = (isOldUser.totalPrice) + ((findProduct.price) * quantity)
            let flag = 0;
            const items = isOldUser.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {
                    console.log(chalk.bgBlue("productId are similars"))
                    items[i].quantity += quantity
                    var newCartData = {
                        items: items,
                        totalPrice: newTotalPrice,
                        quantity: items[i].quantity
                    }
                    flag = 1
                    const saveData = await cartModel.findOneAndUpdate(
                        { userId: userIdFromParams },
                        newCartData, { new: true })
                    return res.status(201).send({
                        status: true,
                        message: "product added to the cart successfully", data: saveData
                    })
                }
            }
            if (flag === 0) {
                console.log(chalk.yellow("productIds are not similar"))
                let addItems = {
                    productId: productId,
                    quantity: quantity
                }
                const saveData = await cartModel.findOneAndUpdate(
                    { userId: userIdFromParams },
                    { $addToSet: { items: addItems }, $inc: { totalItems: 1, totalPrice: ((findProduct.price) * quantity) } },
                    { new: true }).select({ "items._id": 0 })
                return res.status(201).send({ status: true, message: "product added to the cart successfully", data: saveData })
            }
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};


//===================================Update Cart Api (/users/:userId/cart)==========================


const updateCart = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId
        const data = req.body
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, msg: "Plz enter data in body !!!" });
        }
        if (!validator.isValid(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: 'please provide userId' })
        }
        const { productId, cartId, removeProduct } = data

        if (!validator.isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }

        const userByuserId = await UserModel.findById(userIdFromParams);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (req['userId'] != userIdFromParams) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access.",
            });
        }

        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if (findProduct.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product is deleted" });
        }

        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, messege: "please provide cartId" })
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" });
        }

        const findCart = await cartModel.findById(cartId);

        if (!findCart) {
            return res.status(404).send({ status: false, message: 'cart not found.' });
        }

        const findProductInCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } });

        if (!findProductInCart) {
            return res.status(404).send({ status: false, message: 'product not found in the cart.' });
        }

        if (!validator.isValid(removeProduct)) {
            return res.status(400).send({ status: false, messege: "please provide items to delete" })
        }

        if ((isNaN(Number(removeProduct)))) {
            return res.status(400).send({ status: false, message: 'removeProduct should be a valid number' })
        }

        if ((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({ status: false, message: 'removeProduct should be 0 or 1' })
        }
        let findQuantity = findCart.items.find(x => x.productId.toString() === productId)

        if (removeProduct == 0) {
            let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity)
            let quantity = findCart.totalItems - 1
            let newCart = await cartModel.findOneAndUpdate(
                { _id: cartId },
                {
                    $pull: { items: { productId: productId } },
                    $set: { totalPrice: totalAmount, totalItems: quantity }
                }, { new: true })

            return res.status(200).send({
                status: true,
                message: 'the product has been removed from the cart', data: newCart
            })
        }

        if (removeProduct == 1) {
            console.log(chalk.bgBlackBright("quantity decreament starts now"))
            let totalAmount = findCart.totalPrice - findProduct.price
            let items = findCart.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {
                    items[i].quantity = items[i].quantity - 1
                    if (items[i].quantity == 0) {
                        console.log(chalk.bgYellowBright("quantity has become 0 now."))
                        var noOfItems = findCart.totalItems - 1
                        let newCart = await cartModel.findOneAndUpdate(
                            { _id: cartId },
                            {
                                $pull: { items: { productId: productId } },
                                $set: { totalPrice: totalAmount, totalItems: noOfItems }
                            }, { new: true })
                        return res.status(200).send({
                            status: true,
                            message: 'the product has been removed from the cart', data: newCart
                        })
                    }
                }
            }

            console.log(chalk.bgYellowBright("quantity is not 0."))
            let data = await cartModel.findOneAndUpdate(
                { _id: cartId },
                { totalPrice: totalAmount, items: items }, { new: true })

            return res.status(200).send({
                status: true,
                message: 'product in the cart updated successfully.', data: data
            })

        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};


//==========================================Get Cart Api (/users/:userId/cart)=======================


const getCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req['userId']

        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "This is not a valid userId" })
        }

        let checkUser = await UserModel.findOne({ _id: userId })

        if (!checkUser) {
            return res.status(404).send({ status: false, message: " This User Does not exist" })
        }

        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "Unauthorized User" })
        }


        let checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart Not Exist With This User" })
        }
        return res.status(200).send({ status: false, message: "User Cart Details", data: checkCart })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

};

//==================================Delete Cart Api (/users/:userId/cart)===============================


const delCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req['userId']

        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "This is not a Valid User Id" })
        }

        let checkUser = await UserModel.findOne({ _id: userId })

        if (!checkUser) {
            return res.status(404).send({ status: false, message: "This User is Not Exist" })
        }

        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "Unauthorized User" })
        }

        let checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart does Not Exist With This User" })
        }

        let deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        return res.status(200).send({ status: false, message: "Cart Successfully Deleted", data: deleteCart })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};



module.exports = { createCart, updateCart, getCart, delCart };


//========================================End====================================================