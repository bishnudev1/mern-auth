const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        const verifyToken = jwt.verify(token,"Iambishnudevkhutiaastudent");
        const user = await User.findOne({_id:verifyToken._id});
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = auth;