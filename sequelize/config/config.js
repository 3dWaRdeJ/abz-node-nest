require('custom-env').env();
const envData = process.env;

module.exports = {
  "development": {
    "username": envData.DB_USERNAME,
    "password": envData.DB_PASSWORD,
    "database": envData.DB_NAME,
    "host": envData.DB_HOST,
    "dialect": envData.DB_DIALECT
  }
}
