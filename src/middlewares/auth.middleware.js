const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

const authMiddleWare = async(req, res, next) => {
    try{
        const {token} = req.cookies;

        if(!token){
            res.status(401).json({message : "Unauthorized access, token not found"})
        }
  
        const {userId} = await jwt.verify(token, process.env.JWT_SECRET_TOKEN)

        const user = await userModel.findById({_id : userId})

        if(!user){
            res.status(404).json({message : "user not found"})
        }

        req.user = user
        return next()
    }
    catch(err){
        res.json({status : "failed", message : "Oops something went wrong,"  + err.message})
    }
}

module.exports = authMiddleWare