const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : [true, "Email is required for creating a user"],
        unique : [true , "Email already exits"],
        lowercase : true, 
        trim : true,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Not a valid Email"]
    },
    password : {
        type : String,
        required : [true, "Email is required for creating a user"],
        minlength : [6, "Min length of password should be 6"],
        select : false
    },
    name : {
        type : String, 
        required : [true, "Name is required for creating a user"]
    },
    systemUser : {
        type : Boolean,
        default : false,
        immutable : true,
        select : false
    }
}, {
    timestamps : true
})

//dont use arrow functions in schema 

userSchema.pre("save", async function() {
    if(!this.isModified('password')){
        return 
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash

    return 
})

userSchema.methods.comparePassword = async function(passwordFromUser){
    const user = this
    const isPasswordValid = await bcrypt.compare(passwordFromUser, this.password)
    return isPasswordValid
}

const userModel = mongoose.model("users", userSchema)

module.exports = userModel