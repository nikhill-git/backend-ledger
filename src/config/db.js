const mongoose = require("mongoose")

const connectToDB = async() => {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
}


module.exports = connectToDB