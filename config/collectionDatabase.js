var dotenv = require('dotenv')

dotenv.config()

const ENV_AKUNTING = process.env.DB_AKUNTING
const ENV_PABRIK = process.env.DB_PABRIK
const ENV_PABRIK_21 = process.env.DB_PABRIK_21

module.exports = {
  ENV_AKUNTING,
  ENV_PABRIK,
  ENV_PABRIK_21
}