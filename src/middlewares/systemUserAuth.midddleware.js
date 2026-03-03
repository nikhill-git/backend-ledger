const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")


const systemUserAuthMiddleware = async(req, res, next) => {
    try {
        const {token} = req.cookies

        if(!token){
            return res.status(400).json({message : "Token missing login and try again"})
        }

        const {userId} = await jwt.verify(token, process.env.JWT_SECRET_TOKEN)

        const user = await userModel.findOne({_id : userId}).select("+systemUser")

        if(!user.systemUser){
            return res.status(403).json({status : "failed", message : "You are not authorized to access this route"})
        }

        req.user = user
        next()
    }
    catch(err){
        return res.status(401).json({
            status : "failed",
            message : err.message
        })
    }
}

module.exports = systemUserAuthMiddleware