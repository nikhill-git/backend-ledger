const {Router} = require("express")
const accountModel = require("../models/account.model")
const router = Router();

const authMiddleWare = require("../middlewares/auth.middleware")
router.get("/getBalance/:accountId",authMiddleWare, async(req, res) => {
    try {
        const user = req.user;
        //we can find the account by user id, but a user can have multiple accounts, let the user send the accountId
        const {accountId} = req.params
        const userAccount = await accountModel.findOne({user : user._id, _id : accountId});

        if(!userAccount){
            return res.status(401).json({status : "failed", message : "No account exists on your profile"})
        }

        const balance = await userAccount.getBalance()

        return res.status(201).json({status : "Success", balance : balance})

    }
    catch(err){
        return res.status(401).json({status: "failed", message : err.message})
    }
})

router.get("/getAccounts", authMiddleWare, async(req, res) => {
    try {
        const user = req.user;

        const userAccounts = await accountModel.find({user : user._id})

        if(!userAccounts.length){
            return res.status(401).json({
                status : "failed", 
                message : "no accounts founds"
            })
        }

        return res.status(201).json({
            status : "Success",
            accounts : userAccounts
        })
    }
    catch(err) {
        return res.status(401).json({
            status : "failed", 
            message : err.message 
        })
    }
})

module.exports = router