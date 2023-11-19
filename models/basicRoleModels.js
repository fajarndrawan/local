const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const basicRoleModels = (DB) => {
  return DB.define('basic_role', {
    nama: {
      type: DataTypes.STRING
    },
    akses: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  basicRoleModels
}