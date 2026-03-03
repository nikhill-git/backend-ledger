const accountModel = require("../models/account.model.js")

const createAccountController = async(req, res) => {
    try{
        const user = req.user;
        
        const account = await accountModel.create({
            user : user._id
        })

        return res.status(201).json({
            message : "Account Successfully created",
            data : account
        })
    }
    catch(err){
        return res.status(401).json({status : "Failed", message : "Oops something went wrong!" + err.message})
    }
}

module.exports = {
    createAccountController
}