
var express = require('express');
var app = express();


//declare the static file folder directory
app.use(express.static('./public'));




app.listen(3000, function(){
	console.log("This app is listening on port 3001");
})