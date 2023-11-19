const express = require("express")
const { signIn, checkAuth, validateAuth, signOut } = require("../controllers/auth")
const { verifyToken } = require("../middleware/auth")
const router = express.Router()

router.post("/", signIn)
router.post("/validate-auth", verifyToken, validateAuth)
router.get("/check-auth", verifyToken, checkAuth)
router.post("/destroy", verifyToken, signOut)

module.exports = router