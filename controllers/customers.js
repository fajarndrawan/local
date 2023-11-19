const { db_accounting_and_factory } = require('../config/masterDatabase');

const listCustomers = async (req, res) => {
  try {
    let query = `SELECT nama_customer FROM customer`;
    let process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    let currentData = process[0];

    return res.status(200).send({
      meta: {
        message: "Succcess",
        code: res.statusCode,
        success: true,
      }, data: currentData
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

module.exports = { 
  listCustomers
}
