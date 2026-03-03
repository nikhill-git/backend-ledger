
const UserModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service.js")

const authSignUpController = async(req, res) => {
    const {email, password, name} = req.body

    const isUserExist = await UserModel.findOne({email : email})

    if(isUserExist){
        res.status(422).json({
            message : "User already exits",
            status : "failed"
        })
    }

    //password is hashed in the pre method in userSchema
    const user = await UserModel.create({
        email, password, name
    })
    
    const jwtToken = jwt.sign({userId : user._id}, process.env.JWT_SECRET_TOKEN, {expiresIn : "3d"})

    res.cookie("token", jwtToken)

    res.status(201).json({
        user : {
            name : user.name,
            email : user.email,
            _id : user._id
        },
        token : jwtToken
    })

    await emailService.sendSignUpEmail(user.email, user.name)

}

const authLoginController = async(req, res) => {
    const {email, password} = req.body

    const user = await UserModel.findOne({email: email}).select("+password")

    if(!user){
        return res.status(404).json({
            message : "Invalid credentials",
            status : "failed"
        })
    }

    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
        return res.status(404).json({
            message : "invalid credentials",
            status : "failed"
        })
    }

    const jwtToken = await jwt.sign({userId : user._id}, process.env.JWT_SECRET_TOKEN, {expiresIn : "3d"})

    res.cookie("token", jwtToken)

    return res.status(200).json({
        message : "Login successfull",
        status : "success"
    })

}

module.exports = {
    authSignUpController,
    authLoginController
}