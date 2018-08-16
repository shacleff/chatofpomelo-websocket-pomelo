var pomelo = require('pomelo');

//聊天服务器
var routeUtil = require('./app/util/routeUtil');
/**
 * Init app for client.
 */
var app = pomelo.createApp();

//当前应用的名字
app.set('name', 'chatofpomelo-websocket');
 
/**
 * connector服务器
 * app configuration
 */
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,
			useDict : true,
			useProtobuf : true
		});
});

/**
 * 网关服务器
 */
app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});

/**
 * chat应用服务器
 * app configure
 */
app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.filter(pomelo.timeout());
});

// start app
app.start();

//捕捉全局没有被捕捉到的异常错误
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});