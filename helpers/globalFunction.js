const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");

const checkCurrentAuthorization = (req) => {
  let tokenPayload;

  const token = req.body.token || req.query.token || req.headers["x-access-token"];
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if(!err){
          tokenPayload = jwtDecode(token);
      }
  });
  
  return tokenPayload;
}

module.exports = {
  checkCurrentAuthorization
};

