const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const usersModels = (DB) => {
  return DB.define('user', {
    nik: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    barcode: {
      type: DataTypes.STRING
    },
    nama: {
      type: DataTypes.STRING
    },
    jabatan: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    status_login: {
      type: DataTypes.INTEGER
    },
    id_karyawan: {
      type: DataTypes.INTEGER
    },
    id_role: {
      type: DataTypes.INTEGER
    },
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  usersModels
}