const pool = require('./connection.js');

async function createTables() {
  try {
    await pool.poolUser.query(`
      CREATE TABLE IF NOT EXISTS registered (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        about VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        id_proof BYTEA NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admins (
        sn SERIAL PRIMARY KEY,
        admin_id VARCHAR(10) NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS queries (
        queryid SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(11) NOT NULL,
        occupation VARCHAR(100) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        message VARCHAR(400) NOT NULL,
        isresolved BOOLEAN NOT NULL
      ); 

      CREATE TABLE IF NOT EXISTS shapefiles (
        file_id SERIAL PRIMARY KEY,
        file_name VARCHAR(200) NOT NULL,
        is_added BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS shapefile_track (
        file_id SERIAL PRIMARY KEY,
        file_name VARCHAR(200) NOT NULL,
        workspace VARCHAR(200) NOT NULL,
        dataStore VARCHAR(300) NOT NULL,
        public BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS catalog (
        sn SERIAL PRIMARY KEY,
        file_name VARCHAR(200) NOT NULL,
        file_id VARCHAR(10) NOT NULL,
        workspace VARCHAR(200) NOT NULL,
        store VARCHAR(300) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description VARCHAR(300) NOT NULL,
        visibility BOOLEAN
      ); 


      CREATE TABLE IF NOT EXISTS requests (
        requestno SERIAL PRIMARY KEY,
        email VARCHAR(255),
        file_name  VARCHAR(255) NOT NULL,
        is_checked BOOLEAN NOT NULL,
        request_status BOOLEAN NOT NULL
      ); 

      CREATE TABLE IF NOT EXISTS emailotp (
        sn SERIAL PRIMARY KEY,
        email  VARCHAR(200) NOT NULL,
        otp INTEGER NOT NULL
      ); 

      CREATE TABLE IF NOT EXISTS verifiedemails (
        sn SERIAL PRIMARY KEY,
        email  VARCHAR(200) NOT NULL
      ); 

      CREATE TABLE IF NOT EXISTS  useraccess (
        sn SERIAL PRIMARY KEY,
        userid INT,
        files TEXT[],
        fileids INTEGER[]
      ); 

    `);
    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
