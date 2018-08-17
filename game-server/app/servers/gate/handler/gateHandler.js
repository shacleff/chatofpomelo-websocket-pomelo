var dispatcher = require('../../../util/dispatcher');
/**
 * 模块功能：网关
 * 
 * 我觉得这个应该作为第一层处理，因为：用户肯定先通过网关连接进来。 然后开始给用户分配一个connector服务器
 * 
 * 分配完connector服务器，接着可以分配一个session，并且和聊天服务器关联起来
 */
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * 处理用户进来
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;

	//进来的人连uid都没有，那肯定有问题
	if(!uid) {

		//进来的用户没有分配uid...向客户端返回错误码：500
		next(null, {
			code: 500
		});
		return;
	}

	/**
	 * 没有connectors可用
	 * get all connectors
	 */
	var connectors = this.app.getServersByType('connector');

	//没有connector可用，那直接就返回客户端错误码：500
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}

	/**
	 * 为这个uid分配一个connector  
	 * select connector
	 */
	var availableConnector = dispatcher.dispatch(uid, connectors);

	/**
	 * ----玩家登录网关成功,为用户分配一个connector服务器： 玩家
	 * uid:jianan 
	 * availableConnector:{
	 * 	"main":"/Users/lewangame/Documents/Learn/chatofpomelo-websocket/game-server/app.js",
	 * 	"env":"development",
	 * 	"id":"connector-server-3",      //其中这个connector服务器的分配，是根据玩家的uid用一个crc32算法，直接分配一个进程，和rid没关系. 但是不同进程上的用户由于在同一个
	 * 	"host":"127.0.0.1",
	 * 	"port":4052,
	 * 	"clientPort":3052,
	 * 	"frontend":"true",
	 * 	"serverType":"connector",
	 * 	"pid":1945
	 * }
	 */
	console.info("-----玩家登录网关成功,为用户分配一个connector服务器：" +
				" 玩家uid:" + uid +
				" availableConnector:" + JSON.stringify(availableConnector));


	/**
	 * 核心流程第一步：客户端连接gate服务器， gate返回给客户端connector的host和clientPort 
	 * 这个是登录所在的服务器. 和聊天服务器必然不再同一个服务器上，不然就不是多进程了啊
	 */
	next(null, {
		code: 200,                            // 成功标志返回值
		host: availableConnector.host,        // 主机
		port: availableConnector.clientPort   // 端口号
	});

	
};
