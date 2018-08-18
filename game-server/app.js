/**
 * 引入pomelo模块，接着下面可以创建一个pomelo实例
 * 由于位于node_modules中，所以不用写./xxx.js这种写法
 */
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
	app.set('connectorConfig',{
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
	 * 功能：路由配置
	 * 如果当前的服务器类型是chat，就会把路由到routeUtil.chat方法
	 * rotutes的chat属性对应rotuteUtil.chat()方法
	 * 
	 * 单服务器：
	 * 没有给chat定义router，那是因为我们不定义router的话，pomelo会使用一个默认的router完成路由，因为只有一台
	 * chat服务器，那么pomelo总会把所有的请求与路由给这个服务器，所以我们在单服务器中，可以省略chat的路由配置。
	 * 
	 * 多服务器：
	 * 实际应用中，我们都要实现自己的router，而不使用pomelo默认的，因为多台服务器要考虑负载均衡，同时要
	 * 尽量使得服务器的服务是无状态的。 因此我们这里负载均衡使用用户的rid的crc校验码作为键值对当前的所有chat服务器的个数做简单的取模
	 * 运算，使得所有的chat服务器的负载尽可能平衡.
	 * 
	 */
	app.route('chat', routeUtil.chat);

	//过滤器
	app.filter(pomelo.timeout());
});

app.configure('production|development', 'chat', function(){
	//新增脏话过滤器
	var abuseFilter = require('./app/servers/chat/filter/abuseFilter');
	app.filter(abuseFilter());
});


// pomelo app实例开始运行
app.start();

//捕捉全局没有被捕捉到的异常错误
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});