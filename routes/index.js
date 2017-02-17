var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;


// process.env.RDS_HOSTNAME = 'cs3312.clxhlye613oq.us-west-2.rds.amazonaws.com'
// process.env.RDS_USERNAME = 'group161'
// process.env.RDS_PASSWORD = 'group161pass'
// process.env.RDS_PORT = '3306'


var mysql = require('mysql');

var db_connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

db_connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});

// db_connection.query('SELECT * from User', function(err, rows, fields) {
//   if (!err)
//     console.log('The solution is: ', rows);
//   else
//     console.log('Error while performing Query.');
// });