const orderModel = require("../models/orderModel");
const UserModel = require("../Models/userModel");
const cartModel = require("../Models/cartModel");
const userModel = require("../Models/userModel");


//============================== Post Order Api (users/:userId/orders)=================================


const postOrder = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, msg: "Plz enter data in body !!!" });
        }

        const userId = req.params.userId;
        if (userId.length < 24 || userId.length > 24) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Length Of userId in Params !!!" });
        }


        const userFind = await userModel.findOne({ _id: userId });
        if (!userFind) {
            return res.status(404).send({ status: false, msg: "User not found !!!" });
        }

        const jwtUserId = req.userId;
        if (jwtUserId != userId) {
            return res.status(401).send({ status: false, msg: "Not authorized !!!" });
        }

        const cartId = req.body.cartId;
        if (!cartId) {
            return res.staus(400).send({ status: false, msg: "Plz enter cartId in body !!!" });
        }
        if (cartId.length < 24 || cartId.length > 24) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Length Of cartId in Body !!!" });
        }

        const userCart = await cartModel.findOne({ _id: cartId, userId: userId }).select({ items: 1, totalPrice: 1, totalItems: 1 })
        if (!userCart) {
            return res.status(404).send({ status: false, msg: "cartId does not exist with this user !!!" });
        }

        let checkTotalQuantity = 0;
        for (let i = 0; i < userCart.items.length; i++) {
            checkTotalQuantity = checkTotalQuantity + userCart.items[i].quantity;
        }

        const orderDetails = {
            userId: userId,
            items: userCart.items,
            totalPrice: userCart.totalPrice,
            totalItems: userCart.totalItems,
            totalQuantity: checkTotalQuantity
        }

        const saveData = await orderModel.create(orderDetails);
        const newData = await orderModel.findOne({ _id: saveData._id }).select({ "items._id": 0 })
        res.status(201).send({ status: true, message: 'Success', data: newData });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};


//=============================Put Order API (users/:userId/orders)==================================



const putOrder = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, msg: "Plz enter data in body !!!" });
        }

        const user = req.params.userId;
        if (user.length < 24 || user.length > 24) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Length Of userId in Params !!!" });
        }

        const { orderId, status } = data;
        if (!orderId) {
            return res.status(400).send({ status: false, msg: "Plz enter orderId in body !!!" });
        }
        if (!status) {
            return res.status(400).send({ statua: false, msg: "Plz enter status in body !!1" });
        }


        const userId = req.params.userId;
        const userFind = await userModel.findOne({ _id: userId });
        if (!userFind) {
            return res.status(404).send({ status: false, msg: "User not found !!!" });
        }


        const jwtUserId = req.userId;
        if (jwtUserId != userId) {
            return res.status(401).send({ status: false, msg: "Not authorized !!!" });
        }


        const orderFind = await orderModel.findOne({ _id: orderId, userId: userId });
        if (!orderFind) {
            return res.status(404).send({ status: false, msg: "Order not found !!!" });
        }


        if (orderFind.cancellable == true) {
            if (orderFind.status == "pending") {
                const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true });
                if (!updateStatus) {
                    return res.status(400).send({ status: false, message: "Won't able to change status !!!" });
                }
                return res.status(200).send({ status: true, message: "Order updated successfully", data: updateStatus });
            }

            if (orderFind.status == "completed") {
                return res.status(400).send({ status: false, message: "Order already completed, won't able to change status !!!" });
            }

            if (orderFind.status == "canceled") {
                return res.status(400).send({ status: false, message: "Order already cancled !!!" });
            }
        }


        if (orderFind.cancellable == false) {
            return res.status(400).send({ status: false, msg: "its not cancellable !!!" });
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};



module.exports = { postOrder, putOrder };



//==========================================End===================================================