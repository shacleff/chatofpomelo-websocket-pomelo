var exp = module.exports;
var dispatcher = require('./dispatcher');

/**
 * 功能：chat路由函数 返回一个其选择的后端服务器id
 * 
 * @param {*} session 专门用于路由计算的参数，前端服务器由请求给后端服务器发rpc调用时，会使用session作为计算路由的参数，
 * 但是当用户自定定义rpc的时候，用户完全可以自己定义这个参数的含义，当然也可以使用session
 * 
 * @param {*} msg  描述了当前rpc调用的所有信息，包括调用的服务器类型，服务器名字，具体的调用方法等信息
 * 
 * @param {*} app 上下文变量，一般用app
 * 
 * @param {*} cb 获得到后端服务器id后的回调函数 
 */
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

	console.info("-----routeUtil.chat 根据rid分配一个可用的ChatServer服务器 session.get('rid'):" + session.get('rid') 
																						     + " availableChatServer.id:" + availableChatServer.id);

	//
	cb(null, availableChatServer.id);
};