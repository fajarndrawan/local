const express = require("express")
const cors = require("cors")
const bodyparser = require("body-parser")

const { verifyToken } = require("./middleware/auth.js")

const authRoutes = require("./routes/auth.js")
const baseMenuRoutes = require("./routes/baseMenu.js")
const permintaanKirimTokoRoutes = require("./routes/permintaanKirimToko.js")
const customerRoutes = require("./routes/customers.js")

var dotenv = require("dotenv")

dotenv.config()

const app = express()
const host = process.env.IP_LOCAL
const port = process.env.PORT

app.use(cors())

global.__basedir = __dirname
app.use(express.static("./public"))
app.use(bodyparser.json())
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
)

app.use("/api/v1/web/sign-in", authRoutes)
app.use("/api/v1/web/basic-menu", verifyToken, baseMenuRoutes)
app.use("/api/v1/web/customers", customerRoutes)
app.use("/api/v1/web/permintaan-kirim-toko", permintaanKirimTokoRoutes)

if (process.env.NODE_MODE === "DEVELOPMENT") {
  app.listen(port, host, () => {
    console.log(`DEVELOPMENT App listening at http://${host}:${port}`)
  })
} else {
  app.listen(port)
}