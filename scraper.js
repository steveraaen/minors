
const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs')


    request({
        method: 'GET',
        url: 'http://www.sportslogos.net/teams/list_by_league/36/International_League/IL/logos/#team'
    }, (err, res, body) => {
    	var codes=[]
    	 const $ = cheerio.load(body);
        $('#team > .logoWall li').each(function(i, e) {
        	var result ={}
        	var anchr = $(this).children('a')
        	result.class = "AAA"
        	result.league = "International"
        result.title = anchr.attr('title').replace(/ Logos/, "")
        result.image = anchr.find('img').attr('src')
 			codes.push(JSON.stringify(result))     		        
        })  
console.log(codes)
        fs.writeFile('minorClasses.json', codes, function(err) {
        	if(err) {console.log(err)}
        		console.log('written')
        }) 
    })

      