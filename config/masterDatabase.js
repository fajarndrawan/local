var Sequelize = require('sequelize')
var dotenv = require('dotenv')
const dialectOptions = require('./dialectOptions')

dotenv.config()

const masterDB = new Sequelize(process.env.SERVER_DB_NAME, process.env.SERVER_DB_USERNAME, process.env.SERVER_DB_PASSWORD, {
  host: process.env.SERVER_DB_HOST,
  dialect: process.env.SERVER_DB_USE,
  dialectOptions: dialectOptions
})
masterDB
  .authenticate({ logging: false })
  .then(() => {
    console.log(`ORM ${process.env.SERVER_DB_HOST} Connected!`)
  })
  .catch(err => {
    console.error(`Unable ORM connect to the database:${process.env.SERVER_DB_HOST}`)
  })

const db_accounting_and_factory = new Sequelize(process.env.SERVER_DB_NAME_TECHNICAL_SUPPORT, process.env.SERVER_DB_USERNAME, process.env.SERVER_DB_PASSWORD, {
  host: process.env.SERVER_DB_HOST,
  dialect: process.env.SERVER_DB_USE,
  dialectOptions: dialectOptions
  // define: {},
  // dialectOptions: { 
  //   decimalNumbers: true, 
  //   requestTimeout: 3000,
  //   timezone: "Z",
  //   typeCast: function (field, next) {
  //     if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
  //       return new Date(field.string() + 'Z');
  //     } else if (field.type === 'DATE') {
  //       return field.string()
  //     }
  //     return next();
  //   }
  // },
  // pool: {
  //   max: 10,
  //   min: 0,
  //   idle: 10000
  // }
});
db_accounting_and_factory
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = { masterDB, db_accounting_and_factory }