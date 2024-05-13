const express = require('express');
const hbs = require('hbs')
const path = require('path')
const bodyParser = require('body-parser');
require('./src/db/schema')
const app = express();

// const pool = require('./src/db/connection')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const viewpath = path.join(__dirname , "templates/views")
const partialpath = path.join(__dirname , "templates/partials")
console.log(viewpath)


// console.log(pool.pool1)


app.use(express.static('public'));

app.set("view engine", "hbs")
app.set("views", viewpath);
hbs.registerPartials(partialpath);


app.use('/', require('./src/routes/index'));

// Start the Express application
app.listen(3000, () => {
  console.log(`127.0.0.1:3000 listening on port 3000`);
});