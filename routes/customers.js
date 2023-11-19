const express = require("express")
const { listCustomers } = require("../controllers/customers")
const router = express.Router()

router.get("/", listCustomers)

module.exports = router