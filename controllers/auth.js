const jwt = require("jsonwebtoken");
const moment = require("moment");
const { dynamicConnection } = require("../config/dynamicConnection");
const { ENV_PABRIK } = require("../config/collectionDatabase");
const { usersModels } = require("../models/usersModels");
// const bcrypt = require("bcrypt");
const md5 = require("md5");
const { basicRoleModels } = require("../models/basicRoleModels");
const { col } = require("sequelize");
const { userAksesModels } = require("../models/userAksesModels");

const signIn = async (req, res) => {
  try {
    const { username, password, appUse, ipAddress } = req.body
    const DB = await dynamicConnection(ENV_PABRIK, "ORM", res)
    const USERS = usersModels(DB)
    const BASIC_ROLE = basicRoleModels(DB)

    USERS.belongsTo(BASIC_ROLE, { foreignKey: 'id_role', targetKey: 'id' })

    const data = await USERS.findOne({
      // attributes: ["id", "nama", "username", "jenis_hak_akses","id_role_web"], //add column as array for future
      attributes: ["*",
        [col("basic_role.nama"), "role_name"],
        [col("basic_role.akses"), "role_access"],
      ],
      where: {
        nama: username,
        password: md5(password),
      },
      include: [
        {
          model: basicRoleModels(DB),
          attributes: [],
          required: false
        },
      ],
      raw: true
    })
    if (!data) {
      return res.status(403).send({
        meta: {
          message: "username atau password tidak sesuai",
          code: res.statusCode,
          success: false,
        },
      })
    }
    if (!data.role_name) {
      return res.status(403).send({
        meta: {
          message: "anda belum meiliki role akses",
          code: res.statusCode,
          success: false,
        },
      })
    }

    const dataAkses = await userAksesModels(DB).findOne({
      where: {
        nama: data.nama,
        app_use: appUse,
        // ip_address: ipAddress
      }
    })

    if (!dataAkses) {
      await userAksesModels(DB).create({
        nama: data.nama,
        status_login: 1,
        app_use: appUse,
        ip_address: ipAddress
      })
    } else {
      await userAksesModels(DB).update({
        status_login: 1,
        app_use: appUse,
        ip_address: ipAddress
      }, {
        where: {
          nama: data.nama,
          app_use: appUse
        }
      })
    }

    const dateNow = moment()
    const endDays = moment().endOf("day")

    var token = jwt.sign(
      {
        nik: data.nik,
        nama: data.nama,
        id_karyawan: data.id_karyawan,
        id_role: data.id_role,
        appUse
      },
      process.env.TOKEN_SECRET,
      {
        // expiresIn: 86400, //24h expired
        expiresIn: endDays.diff(dateNow, "seconds")
      }
    )

    return res.status(200).send({
      meta: {
        message: "Success!",
        code: res.statusCode,
        success: true,
      },
      data: {
        token,
        basicInfo: {
          id_karyawan: data?.id_karyawan,
          nama: data?.nama,
          jabatan: data?.jabatan,
          roleAkses: data?.role_access?.split(",")
        }
      },
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

const validateAuth = async (req, res) => {
  try {
    const { nama, appUse } = res.locals.userData
    const DB = await dynamicConnection(ENV_PABRIK, "ORM", res)
    const users = await userAksesModels(DB).findOne({
      where: {
        nama: nama,
        app_use: appUse
      },
      raw: true
    })
    if (!users.status_login) {
      return res.status(401).send({
        meta: {
          message: "Unauthorized!",
          code: res.statusCode,
          success: false,
        },
      })
    }
    return res.status(200).send({
      meta: {
        code: res.statusCode,
        success: true,
      },
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

const checkAuth = async (req, res) => {
  try {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (!err) {
        const timeRemain = new Date(decoded.exp * 1000)
        return res.status(200).send({
          meta: {
            message: "Success!",
            date: timeRemain,
            code: res.statusCode,
            success: true,
          }
        })
      }
    })

  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

const signOut = async (req, res) => {
  try {
    const { nama, appUse } = res.locals.userData
    const DB = await dynamicConnection(ENV_PABRIK, "ORM", res)
    await userAksesModels(DB).update({
      status_login: 0,
    }, {
      where: {
        nama: nama,
        app_use: appUse
      }
    })
    return res.status(200).send({
      meta: {
        code: res.statusCode,
        success: true,
      },
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

module.exports = {
  signIn,
  validateAuth,
  checkAuth,
  signOut
}
