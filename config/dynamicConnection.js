var mysql = require('mysql2/promise')
var Sequelize = require('sequelize')
const { serverDb } = require("../models/serverDb")
const dialectOptions = require("./dialectOptions")
// const { masterDB } = require("./masterDatabase")

const dynamicConnection = async (SERVER_CODE, TYPE, res) => {
  if (!SERVER_CODE) {
    return res.status(400).send({
      code: res.statusCode,
      success: false,
      message: `Can't find database`
    })
  }

  res.locals.connectionList = res.locals.connectionList?.length ? res.locals.connectionList : []
  let connDetail
  const serverData = await serverDb.findOne({
    where: { kode_server: SERVER_CODE },
    raw: true
  })

  if (!serverData.id) {
    return res.status(500).send({
      code: res.statusCode,
      success: false,
      message: `Can't find database connection ${SERVER_CODE}`
    })
  }

  //CHOICE CONNECTION
  if (TYPE === "ORM") { //ORM CONNECTION
    connDetail = new Sequelize(serverData.nama_db, serverData.user_id, serverData.pass, {
      host: serverData.ip_server,
      dialect: 'mysql',
      dialectOptions: dialectOptions,
      timezone: 'Asia/Jakarta'
    })
    connDetail
      .authenticate({ logging: false })
      .then(() => {
        console.log(`${TYPE} ${serverData.ip_server} Connected!`)
      })
      .catch(err => {
        return res.status(500).send({
          code: res.statusCode,
          success: false,
          message: `Unable ${TYPE} connect to the database:${serverData.ip_server}`
        })
        // connDetail.close()
      })
    // return connDetail
  } else if (TYPE === "DIRECT") { //DIRECT CONNECTION
    connDetail = mysql.createPool({
      host: serverData.ip_server,
      user: serverData.user_id,
      password: serverData.pass,
      database: serverData.nama_db,
      decimalNumbers: dialectOptions.decimalNumbers,
      timezone: dialectOptions.timezone
    })
    connDetail.getConnection(function (err) {
      if (err) {
        // connDetail.end()
        return res.status(400).send({
          code: res.statusCode,
          success: false,
          message: `Unable ${TYPE} connect to the database:${serverData.ip_server}`
        })
      }
      connDetail.release
      console.log(`${TYPE} ${serverData.ip_server} Connected!`)
    })
    // return connDetail
  }

  res.locals.connectionList.push({
    serverCode: SERVER_CODE,
    type: TYPE,
    host: serverData.ip_server,
    db: connDetail
  })

  return connDetail
}

module.exports = { dynamicConnection }