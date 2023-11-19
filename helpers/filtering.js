var _ = require("lodash");
var { Op } = require("sequelize");
const { formatDate } = require(".");

const getFiltering = (filters) => {
  const array = filters && filters.split(",");
  const obj = {};
  _.map(array, (val) => {
    let element = val.split("~");
    obj[element[0]] = {
      value: element[2],
      parameter: element[1],
    };
  });
  return obj;
};

const filterMapping = (filter, attributes) => {
  // const arr = filter?.split(",") ?? []
  const obj = _.map(filter, idx => {
    const arrIdx = idx.split("~")

    if (arrIdx[1] === "empty") {
      arrIdx[1] = "is"
      arrIdx[2] = null
    }
    if (arrIdx[1] === "notEmpty") {
      arrIdx[1] = "not"
      arrIdx[2] = null
    }
    if (arrIdx[1] === "contains") {
      arrIdx[1] = "like"
      arrIdx[2] = `%${arrIdx[2]}%`
    }
    if (arrIdx[1] === "notContains") {
      arrIdx[1] = "notLike"
      arrIdx[2] = `%${arrIdx[2]}%`
    }
    if (arrIdx[1] === "neq") {
      arrIdx[1] = "ne"
    }
    if (arrIdx[1] === "neq") {
      arrIdx[1] = "ne"
    }
    if (arrIdx[1] === "inrange") {
      arrIdx[1] = "between"
      arrIdx[2] = arrIdx[2].split(";")
    }
    if (arrIdx[1] === "notinrange") {
      arrIdx[1] = "notBetween"
      arrIdx[2] = arrIdx[2].split(";")
    }
    if (arrIdx[1] === "in" || arrIdx[1] === "notIn") {
      arrIdx[2] = arrIdx[2].split(";")
    }
    return {
      [arrIdx[0]]:
      {
        [Op[arrIdx[1]]]: arrIdx[2]
      }
    }
  })
  // console.log("pick")
  const newObj = attributes?.length ?
    _.filter(obj, idx => { return _.some(attributes, ix => ix === Object.keys(idx)[0]) })
    : obj
  // return filter?.length && filter[0] !== ''  ? obj : []
  return filter?.length && filter[0] !== '' ? newObj : []
};

module.exports = { getFiltering, filterMapping };
