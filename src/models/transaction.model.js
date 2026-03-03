const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "accounts",
        required : [true, "transaction must be associated with from account"],
        index : true
    },
    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "accounts",
        required : [true, "transaction must be associated with to account"],
        index : true
    },
    status : {
        type : String,
        enum : {
            values : ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message : "Status can be either pending, completed, rejected, or reversed"
        },
        default : "PENDING"
    },
    amount : {
        type : Number,
        required : [true, "Amount is required for a transaction"],
        min : 0
    },
    // this will be generated form client side
    // this will make sure that transaction is not repeated
    idempotencyKey : {
        type : String,
        required : [true, "Idempotency key is required"],
        unique : true,
        index : true
    }
}, {
    timestamps : true
})

const transactionModel = new mongoose.model("transactions", transactionSchema)

module.exports = transactionModel