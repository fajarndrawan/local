const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const basicMenuAccessModels = (DB) => {
  return DB.define('basic_menu_access', {
    id_basic_menu: {
      type: DataTypes.STRING
    },
    id_basic_role: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  basicMenuAccessModels
}