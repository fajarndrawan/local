const { Sequelize } = require("sequelize")
const { DataTypes } = Sequelize

const userAksesModels = (DB) => {
  const models = DB.define('user_akses', {
    nama: {
      type: DataTypes.STRING
    },
    status_login: {
      type: DataTypes.INTEGER
    },
    app_use: {
      type: DataTypes.STRING
    },
    ip_address: {
      type: DataTypes.STRING
    },
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
  models.removeAttribute('id')

  return models
}

module.exports = {
  userAksesModels
}