const { Sequelize } = require("sequelize")

const { DataTypes } = Sequelize

const jenisPekerjaanModels = (DB) => {
  return DB.define('jenis_pekerjaan', {
    no_pekerjaan: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nama_pekerjaan: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    paranoid: true, //softdelete
    timestamps: false
  })
}

module.exports = {
  jenisPekerjaanModels
}