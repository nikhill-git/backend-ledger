const accountModel = require("../models/account.model")

const validateUserTransactionData = async({fromAccount, toAccount, amount, idempotencyKey}) => {
    try{
        if(!fromAccount || !toAccount || !amount || !idempotencyKey){
            throw new Error("Not a valid data")
        }
        const senderAcc = await accountModel.findOne({_id : fromAccount})

        const reciverAcc = await accountModel.findOne({_id : toAccount})

        if(!senderAcc || !reciverAcc){
            throw new Error("Account doesnt exits")
        }

        if(amount <= 0){
            throw new Error("Amount is not valid")
        }

     if(senderAcc.status !== "ACTIVE" || reciverAcc.status !== "ACTIVE"){
        throw new Error("Account is not active, cant use this account")
     }

     return {success : true, fromAccount : senderAcc, toAccount : reciverAcc}

    }
    catch(err){
        return {success : false, message : err.message}
    }
}

module.exports = validateUserTransactionData