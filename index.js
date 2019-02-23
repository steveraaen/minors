
require('dotenv').config()
const express = require('express')
const mysql = require('mysql')
const cheerio = require('cheerio')
const request = require('request')
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
// Find out which minor league team has produced the most major leaguers in year xxxx
app.get('/api/bestMinors', function(req, res) {
  console.log(req.query)
  pool.getConnection(function(err, connection) {
  connection.query(`select newMinors.team, count(distinct newPlayerMaster.playerID) as playerCount, newPlayerMaster.franchise, newPlayerMaster.yr
from newPlayerMaster, newMinors
where newPlayerMaster.classes REGEXP ? 
and newMinors.class = ?
and newPlayerMaster.yr = ?
and newMinors.franchise = newPlayerMaster.franchise
group by newMinors.team
order by count(newPlayerMaster.playerName) desc`, [req.query.m, req.query.p, req.query.y], function (error, results, fields) {
    console.log(results)
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
// Get leagues for each class
/*app.get('/api/leagues', function(req, res) {
  pool.getConnection(function(err, connection) {
  connection.query('select * from newMinors where franchise IS NOT NULL', function (error, results, fields) {
    console.log(results)
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})*/
// scraper
 
/*app.get('/api/setLogos', function(req, res) {
  pool.getConnection(function(err, connection) {
    request({
        method: 'GET',
        url: 'http://www.sportslogos.net/teams/list_by_league/48/Appalachian_League/AppL/logos/'
    }, (err, res, body) => {
      var codes=[]
       const $ = cheerio.load(body);
        $('#team > .logoWall li').each(function(i, e) {
          var result ={}
          var anchr = $(this).children('a')
          result.class = "Rk"
          result.league = "Appalachian"
          result.title = anchr.attr('title').replace(/ Logos/, "")
          result.image = anchr.find('img').attr('src')

          connection.query(`INSERT INTO minorLogos (class, league, teamName, imageUrl)VALUES (?,?,?,?)`, [result.class ,result.league, result.title ,result.image], function (error) {

    if (error) throw error;
                console.log('results')
            
         });                  
       })  
        connection.release();
    })
  })
})*/


const port = process.env.PORT || 5001;
app.listen(port);
console.log(`Listening on ${port}`);




















