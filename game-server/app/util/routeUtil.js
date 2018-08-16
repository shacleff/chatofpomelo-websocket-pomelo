var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {

	//看看为chat配置的有服务器没. 得到所以配置的聊天服务器
	var chatServers = app.getServersByType('chat');

	//就没有配置任何聊天服务器，那就是有错误
	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	//根据id， 利用crc算法随机分配一个聊天服务器给用户
	var res = dispatcher.dispatch(session.get('rid'), chatServers);

	//
	cb(null, res.id);
};