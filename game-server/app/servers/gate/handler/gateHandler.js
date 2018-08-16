var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
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
	var res = dispatcher.dispatch(uid, connectors);
	next(null, {
		code: 200,             // 成功标志返回值
		host: res.host,        // 主机
		port: res.clientPort   // 端口号
	});
};
