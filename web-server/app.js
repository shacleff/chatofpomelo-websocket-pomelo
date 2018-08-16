var express = require('express');
var app = express();

app.configure(function(){
	
	//
	app.use(express.methodOverride());
	
	//
	app.use(express.bodyParser());

	//
	app.use(app.router);

	//
	app.set('view engine', 'jade');

	//
	app.set('views', __dirname + '/public');

	//
	app.set('view options', {layout: false});

	//
	app.set('basepath',__dirname + '/public');

});

//静态文件路径
app.configure('development', function(){

	app.use(express.static(__dirname + '/public'));

	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

//
app.configure('production', function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
	app.use(express.errorHandler());
});

//监听3001端口
app.listen(3001);

console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");
