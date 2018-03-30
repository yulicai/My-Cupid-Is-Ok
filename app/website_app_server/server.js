/*
* A small experiment for me to log some thingy
*/


// npm install mongojs
// npm install ejs
// npm install body-parser

var config = require("./config.js");

var express = require('express');
var app = express();

var mongojs = require("mongojs");
var db = mongojs(config.username + ":" + config.password + "@ds117489.mlab.com:17489/mycupidisok",["feedback"]);


app.set('view engine','ejs');

var d= new Date();

// the following body-parser is for app.post
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedParser);//using this middleware

//declare the static file folder directory
app.use(express.static('./public'));

app.post('/post_thought',function(req,res){
	var textvalue = req.body.thought;

	res.sendFile('info.html',{root: './public'});
	//timestamp for est
	var offset = -300;
	var estDate = new Date(d.getTime() + offset*60*1000);
	// db.thoughts.save({"content":req.body.textfield, "time":d.getHours() + ":" + d.getMinutes() + "@" + d.getDate()+"/"+ (d.getMonth()+1) + "/" + d.getFullYear()}, function(err,saved){
	db.feedback.save({"content":req.body.thought, "email":req.body.email, "time":estDate}, function(err,saved){
		if(err || !saved) console.log ("Not saved");
		else console.log("thoughts saved");
	});
});



app.listen(3001, function(){
	console.log("This app is listening on port 3001");
})