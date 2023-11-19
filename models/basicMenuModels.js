const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const basicMenuModels = (DB) => {
  return DB.define('basic_menu', {
    nama: {
      type: DataTypes.STRING
    },
    nama_route: {
      type: DataTypes.STRING
    },
    path: {
      type: DataTypes.STRING
    },
    icon: {
      type: DataTypes.STRING
    },
    akses_lainya: {
      type: DataTypes.STRING
    },
    parent_id: {
      type: DataTypes.INTEGER
    },
    urutan: {
      type: DataTypes.INTEGER
    },
    disabled: {
      type: DataTypes.INTEGER
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  basicMenuModels
}