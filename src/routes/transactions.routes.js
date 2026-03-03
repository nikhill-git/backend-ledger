const express = require("express")

const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")

const transactionControllers = require("../controllers/transactionController")
router.post("/",authMiddleware, transactionControllers.createTransaction)


const systemUserAuthMiddleware = require("../middlewares/systemUserAuth.midddleware")
router.post("/system/initial-funds", systemUserAuthMiddleware, transactionControllers.createInitialFunds)

module.exports = router