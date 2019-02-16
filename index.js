
require('dotenv').config()
const express = require('express')
const mysql = require('mysql')

const app = express()


var pool  = mysql.createPool({
    host: process.env.DB_HOST,
    port: '3306',
    user: 'tranch5_sjr',
    password: process.env.DB_PW,
    database: 'tranch5_milb'
});
app.get('/api/summary', function(req, res) {
	pool.getConnection(function(err, connection) {
  connection.query('select year, minorTeam,  count(player), franchise, class from supermaster  group by minorTeam , year order by count(player) desc', function (error, results, fields) {
    console.log(results)
    	res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
app.get('/api/allMinors', function(req, res) {
	pool.getConnection(function(err, connection) {
  connection.query('select * from newMinors where franchise IS NOT NULL', function (error, results, fields) {
    console.log(results)
    	res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
app.get('/api/bestMinors', function(req, res) {
  console.log(req.query)
  pool.getConnection(function(err, connection) {
  connection.query(`select newMinors.team, count(distinct newPlayerMaster.playerID) as playerCount, newPlayerMaster.franchise, newPlayerMaster.yr
from newPlayerMaster, newMinors
where newPlayerMaster.classes REGEXP ? 
and newMinors.class = ?
and newPlayerMaster.yr = 2013
and newMinors.franchise = newPlayerMaster.franchise
group by newMinors.team, newPlayerMaster.yr
order by newPlayerMaster.yr, count(newPlayerMaster.playerName) desc`, [req.query.m, req.query.p], function (error, results, fields) {
    console.log(results)
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})



const port = process.env.PORT || 5001;
app.listen(port);
console.log(`Listening on ${port}`);