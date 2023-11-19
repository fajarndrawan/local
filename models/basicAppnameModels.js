const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const basicAppnameModels = (DB) => {
  return DB.define('basic_appname', {
    nama: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  basicAppnameModels
}