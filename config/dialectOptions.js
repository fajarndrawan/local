const dialectOptions = {
  decimalNumbers: true,
  // useUTC: false, //for reading from database
  timezone: "Z",
  typeCast: function (field, next) {
    if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
      return new Date(field.string() + 'Z');
    } else if (field.type === 'DATE') {
      return field.string()
    }
    return next();
  }
}

module.exports = dialectOptions