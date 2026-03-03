const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "accounts",
        required : [true, "Account is required to create a ledger"],
        immutable : true,
        index : true
    },
    amount : {
        type : Number,
        required : [true, "Amount is required"],
        immutable : true
    },
    transaction : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "transactions",
        required : [true, "A ledger must be associated with a transaction"],
        immutable : true
    },
    type : {
        type : String,
        enum : {
            values : ["DEBIT", "CREDIT"],
            message : "values can be either credit or debit"
        },
        required : [true, "type is required"],
        immutable : true
    }
},
{ 
    timestamps : true
})

function preventLedgerModification () {
    throw new Error("Ledger entries cant be modified")
}

ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification)
ledgerSchema.pre("updateOne", preventLedgerModification)
ledgerSchema.pre("deleteOne", preventLedgerModification)
ledgerSchema.pre("remove", preventLedgerModification)
ledgerSchema.pre("deleteMany", preventLedgerModification)

const ledgerModel = new mongoose.model("ledgers", ledgerSchema)

module.exports = ledgerModel