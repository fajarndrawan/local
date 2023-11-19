const { ENV_PABRIK } = require("../config/collectionDatabase");
const { dynamicConnection } = require("../config/dynamicConnection");
const { userAkunting, usersModels } = require("../models/usersModels");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({
          status: "tokenExpire",
          error: err,
        })
      }
      return res.status(401).send({
        message: "Unauthorized!",
        error: err
      })
    }
    // req.username = decoded.username;
    // console.log(users)
    if (req.query.isUsers) {//check user db
      const DB = dynamicConnection(ENV_PABRIK, "ORM", res)
      const users = await usersModels(DB).findOne({
        where: {
          nama: decoded.nama
        },
        raw: true
      })
      res.locals.userData = users
    }
    else {
      res.locals.userData = decoded
    }
    next()
  })
}

const refreshToken = async (req, res, next) => {
  const token =
    req.body.refreshToken || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  const { data } = req.body;

  const dataUsers = await userAkunting.findOne({
    attributes: ["username", "refreshToken"],
    where: {
      id: data?.idUsers,
    },
  })

  jwt.verify(
    dataUsers?.refreshToken ?? token,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      //serverside refresh token
      if (err) {
        return res.status(401).send({
          //reload ke halaman login
          message: "Unauthorized!",
          error: err,
        })
      }
      req.username = decoded.username;
      if (req.username) {
        var token = jwt.sign(
          {
            username: decoded.username,
          },
          process.env.TOKEN_SECRET,
          {
            expiresIn: 10800, //3h expired refresh setiap 3 jam
          }
        )
        return res.send({ token: token });
      }
    }
  )
}

module.exports = {
  verifyToken,
  refreshToken
};
