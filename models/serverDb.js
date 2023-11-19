const { Sequelize } = require("sequelize");
const { masterDB } = require("../config/masterDatabase");

const { DataTypes } = Sequelize;

const serverDb = masterDB.define('server_db', {
  kode_server: {
    type: DataTypes.STRING
  },
  nama_server: {
    type: DataTypes.STRING
  },
  ip_server: {
    type: DataTypes.STRING
  },
  user_id: {
    type: DataTypes.STRING
  },
  pass: {
    type: DataTypes.STRING
  },
  nama_db: {
    type: DataTypes.STRING
  },
  keterangan: {
    type: DataTypes.STRING
  },
  user_inputer: {
    type: DataTypes.STRING
  },
  input_date: {
    type: DataTypes.DATE
  }
}, {
  freezeTableName: true,
  paranoid: true, //softdelete
  timestamps: false
  // deletedAt: 'destroyTime' //if youwant custom name deletedAt to destroyTime
})

module.exports = {
  serverDb
}