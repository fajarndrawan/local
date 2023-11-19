var _ = require("lodash");

const getColumns = (arrayAttributes, dataColumns) => {
  const resultDataColumns = dataColumns?.length ? Object.keys(dataColumns[0]) : []
  const arrayColumns = _.map(arrayAttributes, idx => {return Object.values(idx.tableAttributes)})
  const joinArrayColumns = _.map(_.flatten(arrayColumns), idx => {
    return {
      fieldName: idx.fieldName, 
      dataType: idx.type.constructor.key,
      decimalComma : idx.type.constructor.key === "DECIMAL" ? idx.type?.options?.scale : undefined
    }
  })
  const filterArrayColumns = _.filter(joinArrayColumns, idx => _.find(resultDataColumns, ix => ix === idx.fieldName))
  const reduceArrayColumns =  Object.values(_.reduce(filterArrayColumns, (a, v) => { 
                                if(a[v.fieldName]) {     
                                } else {
                                  a[v.fieldName] = v
                                }
                                return a
                              }, {}))
  const columnsResult = _.map(reduceArrayColumns, idx => {
                          idx.index = _.findIndex(resultDataColumns, (e) => {
                              return e === idx.fieldName;
                          }, 0)
                          return idx
                        });
  return _.sortBy(columnsResult, (e) => {
      return e.index
  })
}

module.exports = { getColumns };
