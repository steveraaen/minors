
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
    database: 'tranch5_milb',
     multipleStatements: true
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
 /*   console.log(results)*/
    	res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
// Find out which minor league team has produced the most major leaguers in year xxxx
app.get('/api/bestMinors', function(req, res) {
 /* console.log(req.query)*/
  pool.getConnection(function(err, connection) {
  connection.query(`select newMinors.team, newMinors.logo, count(distinct newPlayerMaster.playerID) as playerCount, newPlayerMaster.franchise, newPlayerMaster.yr
from newPlayerMaster, newMinors, batting18
where newPlayerMaster.classes REGEXP ? 
and batting18.teamID = newPlayerMaster.franchise
and batting18.lgID REGEXP ?
and newMinors.class = ?
and newPlayerMaster.yr = ?
and newMinors.franchise = newPlayerMaster.franchise
group by newMinors.team
order by count(newPlayerMaster.playerName) desc`, [req.query.m, req.query.d, req.query.p, req.query.y], function (error, results, fields) {
   /* console.log(results)*/
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
app.get('/api/batterList', function(req, res) {
 /* console.log(req.query)*/
  pool.getConnection(function(err, connection) {
  connection.query(`select distinct newPlayerMaster.playerName, batting18.lgID, batting18.G, 
    batting18.AB, batting18.H, (batting18.H/batting18.AB) as AVG, batting18.2B, 
    batting18.3B, batting18.HR, batting18.teamID,
    batting18.RBI, batting18.SB, batting18.BB, batting18.SO, batting18.HBP
    from newPlayerMaster, batting18 
    where newPlayerMaster.classes REGEXP ?
    and batting18.playerID = newPlayerMaster.playerID
    and newPlayerMaster.franchise = ?
    and newPlayerMaster.yr = ?
    order by AB desc `, [req.query.r, req.query.f, req.query.y], function (error, results, fields) {

    /*    console.log(results)*/
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
app.get('/api/pitcherList', function(req, res) {
/*  console.log(req.query)*/
  pool.getConnection(function(err, connection) {
  connection.query(`select distinct newPlayerMaster.playerName, pitching18.lgID, pitching18.G, 
    (pitching18.IPouts / 3) as IP, pitching18.W, pitching18.L, pitching18.IBB,
    pitching18.IBB,pitching18.GF, pitching18.GS, pitching18.SV, pitching18.teamID,
    pitching18.H, pitching18.ER, pitching18.BB, pitching18.SO, pitching18.HBP
    from newPlayerMaster, pitching18 
    where newPlayerMaster.classes REGEXP ?
    and pitching18.playerID = newPlayerMaster.playerID
    and newPlayerMaster.franchise = ?
    and newPlayerMaster.yr = ?
    order by (pitching18.IPouts / 3) desc `, [req.query.r, req.query.f, req.query.y], function (error, results, fields) {

    /*    console.log(results)*/
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });        
})
/*app.get('/api/topBatting', function(req, res) {
  pool.getConnection(function(err, connection) {
  connection.query(`select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and bAB > 1000  order by bBA desc limit 5;
                    select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and bAB > 1000  order by bBA desc limit 5;
                    select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and bAB > 200  order by bBA desc limit 5;
                    select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and bAB > 200  order by bBA desc limit 5;
                    select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and bAB > 200  order by bBA desc limit 5;`, ['Triple-A','Double-A','Class A','Class A Advanced','Class A Short'], function (error, results, fields) {
    console.log(results)
      res.json(results)
    connection.release();

    if (error) throw error;
   });
 });
})
app.get('/api/topPitching', function(req, res) {
  pool.getConnection(function(err, connection) {
  connection.query(`select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and pIP > 300  order by pER limit 5;
                    select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and pIP > 300  order by pER limit 5;
                    select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and pIP > 150  order by pER limit 5;
                    select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and pIP > 150  order by pER limit 5;
                    select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and pIP > 150  order by pER limit 5;`, ['Triple-A','Double-A','Class A','Class A Advanced','Class A Short'], function (error, results, fields) {
    console.log(results)
      res.json(results)
    connection.release();
    if (error) throw error;
   });
 });
})*/
app.get('/api/classSummary', function(req, res) {
  console.log(req.query)
  pool.getConnection(function(err, connection) {
  connection.query(`select className as cl, logo, color, milbTeam, yr, pG, pW, pL, pSV, pER, pIP, majteam, franchiseLogo from summary18 where className = ? and divID like ? and yr like ?  and pIP > 300  order by pER limit 5;
                    select className as cl, logo, color, milbTeam, yr, bG, bAB, bBA, bHR, bSO, majteam, franchiseLogo from summary18 where className = ? and divID like ? and yr like ?  and bAB > 1000  order by bBA desc limit 5;`, 
                    [req.query.cl, req.query.dv, req.query.yr, req.query.cl, req.query.dv, req.query.yr ], function (error, results, fields) {
       console.log(results)
      res.json(results)
    connection.release();
    if (error) throw error;
   });
 });
})
// Use once to aggregate stats
/*app.get('/api/sendStats', function(req, res) {
 var btr = JSON.parse(req.query.ba)
 var ptc = JSON.parse(req.query.pi)
 var tm = JSON.parse(req.query.tm)
  pool.getConnection(function(err, connection) {
  connection.query(`INSERT INTO overall18 (milbTeam, logo, color, franchiseLogo, yr, className, division, bAB, bBA, bBB, bH, bHBP, bHR, bSB, bSO, bG, pBB,
     pER, pERA, pG, pGS, pH, pIP, pL, pSO, pSV, pW ,pHBP, pIBB)VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
     [tm.name, tm.logo, tm.color, tm.franchiseLogo, req.query.yr, req.query.dv, req.query.cl, btr.AB, btr.AVG, btr.BB,  btr.H, btr.HBP, btr.HR, btr.SB, btr.SO,btr.G,
     ptc.BB, ptc.ER, ptc.ERA, ptc.G, ptc.GS, ptc.H, ptc.IP, ptc.L, ptc.SO, ptc.SV, ptc.W, ptc.HBP, ptc.IBB ], function (error, results, fields) {

        console.log('results')
      res.json('results')
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




















