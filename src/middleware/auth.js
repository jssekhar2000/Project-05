const jwt = require('jsonwebtoken');



const authToken = (token) => {
    let tokenValidate = jwt.verify(token, "GroupNo14", (err, data) => {
        if (err)
            return null
        else {
            return data
        }
    })
    return tokenValidate
}

//=============================Authentication==============================================

const authentication = async function (req, res, next) {
    try {
        let token1 = req.headers['authorization'];
        if (!token1) token1 = req.headers["Authorization"];
        if (!token1) {
            return res.status(400).send({ Error: "Enter Token In BearerToken !!!" });
        }

        let token2 = token1.split(" ")
        let token0 = token2[1]
        let checktoken = authToken(token0)
        if (!checktoken) {
            return res.status(401).send({ Status: false, msg: "InValid Token !!!" });
        }

        req['userId'] = checktoken.userId;
        next();
    }

    catch (err) {
        res.status(500).send({ msg: err.message });
    }
};



module.exports = { authentication };