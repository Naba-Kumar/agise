const pg = require('pg');
require('dotenv').config();

const poolUser = new pg.Pool({
    user: process.env.db_user,
    host: process.env.host,
    database:process.env.user_db,
    password: process.env.db_pw,
    port: process.env.db_port
});

const poolShp = new pg.Pool({
    user: process.env.db_user,
    host: process.env.host,
    database:process.env.shp_db,
    password: process.env.db_pw,
    port: process.env.db_port
});
module.exports = {
    poolUser:poolUser,
    poolShp:poolShp
};

console.log("connected")