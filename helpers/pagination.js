const  getPagination = (page, size) => {
  const limit = size ? parseInt(size) : 10;
  const offset = page ? (parseInt(page) - 1) * limit : 0;
  return { limit, offset };
};

const  getPagingData = (data, page, limit) =>  {
  // const { count: totalItems, rows: rows } = data;
  const tempData = data;
  let totalItems = tempData.count.length ? tempData.count.length : tempData.count
  let rows = tempData.rows
  // const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page ? parseInt(page) : 1;
  // const currentPageItems = totalItems - ((currentPage + 1) * totalItems);
  const currentPageItems = totalItems - ((currentPage * limit));
  return { 
    pagination: {totalItems, totalPages, currentPage, currentPageItems},
    data: rows
    // debug: page,
  };
};

module.exports = {getPagination, getPagingData}