const express = require("express")
const { getBasicMenu, getRoute } = require("../controllers/baseMenu")
const router = express.Router()

router.get("/", getBasicMenu)
router.get("/route-access", getRoute)

module.exports = router