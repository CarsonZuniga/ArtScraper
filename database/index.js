var fs = require('fs');
var mysql = require('mysql2');

const DATAFILE = './catalog.txt';

/** Parse the data file **/
var database_array = fs.readFileSync(DATAFILE).toString().split("\r").splice(1);
var parsed_db_array = [];

database_array.forEach(artpiece => {
    let fix_art = artpiece.split("\t");
    if (fix_art.length != 11)
        return;
    fix_art[0] = fix_art[0].slice(1);       // remove '/n' from first string
    for(let i = 0; i < fix_art.length; i++) {
        fix_art[i] = fix_art[i].replaceAll('"', ''); // remove all double quotes
    }
    let img_url = fix_art[6].replace('html', 'detail').replace('html', 'jpg');
    fix_art.splice(7, 0, img_url);
    parsed_db_array.push(fix_art);
});

/**  **/

/** Push to database **/

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '*********'
});

// Connect to MySQL
connection.connect((error) => {
    if (error)
        throw error;
    console.log("Connected to database");
});

const DATABASE_NAME = "Artscraper";
const TABLE_NAME = 'Artworks';

// Create the database
connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};`, (err, result) => {
    if (err)
        throw err;
    console.log("Database created");
});

// Use the database
connection.query(`USE ${DATABASE_NAME};`, (err, result) => {
    if (err)
        throw err;
    console.log("Chose database");
});

// Create the table
let table_command = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (artID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, AUTHOR VARCHAR(255), BORN_DIED VARCHAR(255), TITLE VARCHAR(255), DATE VARCHAR(255), TECHNIQUE VARCHAR(255), LOCATION VARCHAR(255), URL VARCHAR(255), IMG_URL VARCHAR(255), FORM VARCHAR(255), TYPE VARCHAR(255), SCHOOL VARCHAR(255), TIMEFRAME VARCHAR(255));`;
connection.query(table_command, (err, result) => {
    if (err)
        throw err;
    console.log("Table created");
});

// Batch insert into table
connection.query(`INSERT INTO ${TABLE_NAME} (AUTHOR, BORN_DIED, TITLE, DATE, TECHNIQUE, LOCATION, URL, IMG_URL, FORM, TYPE, SCHOOL, TIMEFRAME) VALUES ?`, [parsed_db_array], function(err) {
    if (err)
        throw err;
    console.log("All artworks pushed to table");
});

/**  **/

/** Choose random row from table **/

connection.query(`SELECT * FROM ${TABLE_NAME} ORDER BY RAND() LIMIT 1;`, function(err, res) {
    if (err)
        throw err;
    console.log(res);
});

connection.end();