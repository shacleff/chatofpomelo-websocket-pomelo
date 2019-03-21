var pomelo = require('pomelo');                            // 引入node_modules中的pomelo模块
var routeUtil = require('./app/util/routeUtil');           // 聊天服务器
var helloWorld = require('./app/components/HelloWorld');   // 组件
var timeReport = require('./app/modules/timeReport');      // 监控上报

var app = pomelo.createApp();

app.set('name', 'chatofpomelo-websocket');                  // 当前应用的名字

app.configure('production|development', 'gate', function(){ // gate
	app.set('connectorConfig', {
		connector : pomelo.connectors.hybridconnector,
		useProtobuf : true
	});
});

app.configure('production|development', 'connector', function(){ // connector
	app.set('connectorConfig',{
		connector : pomelo.connectors.hybridconnector,
		heartbeat : 3,                                   		//心跳3s检测一次
		useDict : true,                                  		//
		useProtobuf : true                               		//使用protobuf压缩
	});
});

app.configure('production|development', function() {            // chat应用服务器
	
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

	app.route('time', routeUtil.getCurrentTime);             // 时间服务器
	app.filter(pomelo.timeout());                            // 过滤器
});

app.configure('production|development', 'chat', function(){
	var abuseFilter = require('./app/servers/chat/filter/abuseFilter'); // 新增脏话过滤器
	app.filter(abuseFilter());
});

/**
 * 功能：route路由压缩
 * 当服务端给客户端发送的消息路由确定的时候，比如onLeave onChat onAdd等消息，这样的路由长度还是过长，
 * 浪费了带宽，为了缩短路由信息，pomelo采用了基于字典的路由信息压缩
 * 在dictionary.json中配置即可
 */
app.configure('production|development', 'gate', function(){
	app.set('connectorConfig', {
		connector: pomelo.connectors.hybridconnector,
		useDict: true,
		useProtobuf: true  //使用protobuf压缩
	});
});

//component
// app.configure('production|development', 'master', function() {
// 	app.load(helloWorld, {interval: 5000});
// });  

//上报
// app.registerAdmin(timeReport, {app: app});

app.start();

process.on('uncaughtException', function(err) {
	console.error('全局 Caught exception: ' + err.stack);
});