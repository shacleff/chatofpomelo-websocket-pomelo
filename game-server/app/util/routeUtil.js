var exp = module.exports;
var dispatcher = require('./dispatcher');

// 返回一个可用的chat服务器的id
exp.chat = function(session, msg, app, cb) {
	var chatServers = app.getServersByType('chat');
	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}
	var availableChatServer = dispatcher.dispatch(session.get('rid'), chatServers);
	cb(null, availableChatServer.id);
};

// 返回一个可用的时间服务器的id
exp.getCurrentTime = function(routeParam, msg, app, cb){
	var timeServers = app.getServersByType('time');
	var availableTimeServer = dispatcher.dispatch(routeParam.crcUid, timeServers);
	cb(null, availableTimeServer.id);
};