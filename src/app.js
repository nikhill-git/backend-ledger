require("dotenv").config();
const express = require("express");
const connectToDB = require("./config/db.js");
const port = 2000;
const cookieParser = require("cookie-parser")

const app = express();
app.use(express.json())
app.use(cookieParser())


const authRouter = require("./routes/userAuth.routes.js")
const accountRouter = require("./routes/accounts.routes.js")
const transactionRouter = require("./routes/transactions.routes.js")
const profileRouter = require("./routes/profile.routes.js")
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter)
app.use("/api/profile", profileRouter)



connectToDB().then(() => {
  console.log("Server connected to Database successfully!");
  app.listen(port, () => {
    console.log("Server running successfully on port: 3000");
  })
}).catch(err => {
    console.log("Error in connecting to database")
    process.exit(1)
})




