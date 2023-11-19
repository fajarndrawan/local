const _ = require("lodash");

const replicaModel = (array) => {
  let object = {
    tableAttributes: {}
  }
  _.forEach(array, idx => {
    object.tableAttributes[idx?.name] = {
      fieldName: idx?.name,
      type: {
        constructor: {
          key: idx?.type
        },
        options : idx?.decimalComma ? {
          scale: idx?.decimalComma ?? 4
        } : undefined
      }
    }
  })
  return object
}

module.exports = {
  replicaModel
}

