const { Sequelize } = require("sequelize")
const { DataTypes } = Sequelize

const usersModels = (DB) => {
  return DB.define('f_tbl_permintaan_kirim_toko', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nama_kain: {
      type: DataTypes.STRING
    },
    jenis_warna: {
      type: DataTypes.STRING
    },
    tanggal: {
      type: DataTypes.STRING
    },
    total_permintaan_import: {
      type: DataTypes.INTEGER
    },
    tanggal_input: {
      type: DataTypes.STRING
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    cabang: {
      type: DataTypes.STRING
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