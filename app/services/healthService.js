const { checkDbConnection } = require('../databaseConfig/databaseConnect.js');

// checking database connection
const healthCheckAPI = async () => {
    return await checkDbConnection();
};

module.exports = { healthCheckAPI };
