var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {

	//根据类型(当前是chat)，获取服务器列表
	var chatServers = app.getServersByType('chat');

	//就没有配置任何聊天服务器，那就是有错误
	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	/**
	 * 根据rid， 利用crc算法,获取具体的chat聊天服务器给用户. 
	 * 特别注意：这个可不是所谓的随机分配，这不然就大错特错了。而是根据用户最初登录的聊天服务器，根据rid还分配给他登录的服务器
	 */
	var availableChatServer = dispatcher.dispatch(session.get('rid'), chatServers);

	//
	cb(null, availableChatServer.id);
};