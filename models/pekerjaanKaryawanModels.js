const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const jenisKaryawanModels = (DB) => {
  return DB.define('pekerjaan_karyawan', {
    id_karyawan: {
      type: DataTypes.INTEGER
    },
    no_pekerjaan: {
      type: DataTypes.INTEGER
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  jenisKaryawanModels
}