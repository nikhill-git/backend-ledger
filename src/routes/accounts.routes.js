const express = require("express")

const router = express.Router()

const authMiddleWare = require("../middlewares/auth.middleware.js")
const accountController = require("../controllers/accountController.js")

router.post("/", authMiddleWare, accountController.createAccountController)

module.exports = router