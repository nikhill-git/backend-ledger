const express = require("express")

const router = express.Router()

const authController = require("../controllers/authController.js")

router.post("/signup", authController.authSignUpController)

router.post("/login", authController.authLoginController)

module.exports = router