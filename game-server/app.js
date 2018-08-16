//引入pomelo模块，接着下面可以创建一个pomelo实例
var pomelo = require('pomelo');

//聊天服务器
var routeUtil = require('./app/util/routeUtil');

/**
 * 初始化一个pomelo app实例
 */
var app = pomelo.createApp();

//当前应用的名字
app.set('name', 'chatofpomelo-websocket');
 
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
 * connector服务器
 */
app.configure('production|development', 'connector', function(){

	//
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,                                   //心跳3s检测一次
			useDict : true,                                  //
			useProtobuf : true                               //使用protobuf协议
		});
});

/**
 * chat应用服务器
 */
app.configure('production|development', function() {
	
	/**
	 * 路由配置
	 * 如果当前的服务器类型是chat，就会把路由到routeUtil.chat方法
	 * rotutes的chat属性对应rotuteUtil.chat()方法
	 */
	app.route('chat', routeUtil.chat);

	//过滤器
	app.filter(pomelo.timeout());
});

// pomelo app实例开始运行
app.start();

//捕捉全局没有被捕捉到的异常错误
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});