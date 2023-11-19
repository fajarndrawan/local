var _ = require("lodash");

const mysqlColumnType = [
  { "DECIMAL": 0 },
  { "TINY": 1 },
  { "SHORT": 2 },
  { "LONG": 3 },
  { "FLOAT": 4 },
  { "DOUBLE": 5 },
  { "NULL": 6 },
  { "TIMESTAMP": 7 },
  { "LONGLONG": 8 },
  { "INT24": 9 },
  { "DATE": 10 },
  { "TIME": 11 },
  { "DATETIME": 12 },
  { "YEAR": 13 },
  { "NEWDATE": 14 },
  { "VARCHAR": 15 },
  { "BIT": 16 },
  { "JSON": 245 },
  { "NEWDECIMAL": 246 },
  { "ENUM": 247 },
  { "SET": 248 },
  { "TINY_BLOB": 249 },
  { "MEDIUM_BLOB": 250 },
  { "LONG_BLOB": 251 },
  { "BLOB": 252 },
  { "VAR_STRING": 253 },
  { "STRING": 254 },
  { "GEOMETRY": 255 }
]
const conversionColumns = [
  {
    STRING: [15, 247, 253, 254]
  },
  {
    DATE: [10, 7, 11, 12, 14]
  },
  {
    INTEGER: [1, 2, 3, 9]
  },
  {
    DECIMAL: [0, 4, 5, 246]
  }
]

const getDBColumnType = (array) => {
  const data = _.map(array, idx => {
    const obj = {}
    const typeConversion = _.find(conversionColumns, ix =>
      _.some(Object.values(ix), i => _.some(i, x => x === idx.columnType))
    )
    obj.fieldName = idx.name
    obj.columnType = idx.columnType
    obj.dataType = Object.keys(typeConversion ?? {})[0] ?? "STRING"
    return obj
  })
  // return data
  return _.uniqBy(data, 'fieldName')
}

module.exports = { getDBColumnType }
