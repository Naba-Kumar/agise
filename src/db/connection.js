const pg = require('pg');

const poolUser = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'agisuser',
    password: '306090',
    port: 5432
});

const poolShp = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'testgis',
    password: '306090',
    port: 5432
});
module.exports = {
    poolUser:poolUser,
    poolShp:poolShp
};

console.log("connected")