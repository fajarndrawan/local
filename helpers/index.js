var moment = require("moment");
var _ = require("lodash");

const formatDate = (date, format) => {
  if (format === "en") {
    format = "MMM Do YYYY";
  } else if (format === "jp") {
    format = "YYYY年 MM月 DD日";
  } else if (format === "id") {
    format = "DD/MM/YYYY H:mm";
  } else if (format === "sql-datetime") {
    // format = "YYYY-MM-DD h:mm:ss a";
    format = "YYYY-MM-DD HH:mm:ss";
  } else if (format === "sql-date") {
    format = "YYYY-MM-DD";
  } else if (format === "sql-date-excel") {
    return !isNaN(date)
      ? moment(new Date((date - 25569) * 86400000)).format("YYYY-MM-DD")
      : moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
  } else {
    format = "MMM Do YYYY";
  }

  return moment(date).format(format);
};

const nestingMap = (data, dataClone, flaging, childName) => {
  for (var i = 0; i < data.length; i++) {
    /* do something useful */
    _.map(dataClone, (idx, key) => {
      if (idx[flaging[0]] === data[i][flaging[1]]) {
        dataClone[key][childName] = dataClone[key][childName]?.length
          ? [...dataClone[key][childName], data[i]]
          : [data[i]];
      }
    });
  }
};

const getStringArr = (arr) => {
  const arrString = [];
  _.map(arr, (idx) => {
    if (idx === "date") {
      if (_.some(arrString, (i) => i === "tgl_awal")) {
        arrString.push("tgl_akhir");
      } else {
        arrString.push("tgl_awal");
      }
    } else if (idx === "datetime") {
      if (_.some(arrString, (i) => i === "tgl_jam_awal")) {
        arrString.push("tgl_jam_akhir");
      } else {
        arrString.push("tgl_jam_awal");
      }
    }
  });
  return arrString;
};

const getFilterParameter = (arr) => {
  if (arr?.length) {
    const newArrObj = _.map(arr, (idx) => {
      let arrIdx = idx.split("~");
      return {
        name: arrIdx[0],
        value: arrIdx[0].includes("tgl")
          ? formatDate(
              arrIdx[2],
              arrIdx[0].includes("tgl_jam") ? "sql-datetime" : "sql-date"
            )
          : arrIdx[2],
      };
    });
    // _.mapValues(_.keyBy(arrIdx, arrIdx[0]), arrIdx[2])
    const obj = _.mapValues(_.keyBy(newArrObj, "name"), "value");
    return obj;
  }
};

module.exports = { formatDate, nestingMap, getStringArr, getFilterParameter };
