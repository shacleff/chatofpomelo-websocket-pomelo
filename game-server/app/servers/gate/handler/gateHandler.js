var dispatcher = require('../../../util/dispatcher');

var crc = require('crc');

/**
 * 模块功能：网关
 *   1.我觉得这个应该作为第一层处理，因为：用户肯定先通过网关连接进来。 然后开始给用户分配一个connector服务器
 * 	 2.分配完connector服务器，接着可以分配一个session，并且和聊天服务器关联起来
 *   3.此后，connector作为承载客户端连接和接下来的交互功能
 */
module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

var handler = Handler.prototype;

handler.queryEntry = function (msg, session, next) {          // 处理用户进来
	var uid = msg.uid;
	if (!uid) { 										      // 进来的人没传入uid，报500错
		next(null, {
			code: 500
		});
		return;
	}

	var connectors = this.app.getServersByType('connector');  // 得到所有connector服务器
	if (!connectors || connectors.length === 0) { 			  // 无服务器可用
		next(null, {
			code: 500
		});
		return;
	}

	// 远程调用time服务器查询当前时间 这个参数看着没用，其实在routeUtil中可以看出来是发给哪个Time服务器
	var routeParam = {
		crcUid: crc.crc32(uid)
	};

	// 前端服务器gatehandler 调用后端服务器timeRemote来完成功能
	this.app.rpc.time.timeRemote.getCurrentTime(routeParam, 'test arg1', 'test arg2', function (hour, min, sec) {
		var availableConnector = dispatcher.dispatch(uid, connectors);  // 获得一个可用的connector服务器
		next(null, {
			code: 200,                            // 成功标志返回值
			host: availableConnector.host,        // 主机
			port: availableConnector.clientPort   // 端口号
		});

	});
};
