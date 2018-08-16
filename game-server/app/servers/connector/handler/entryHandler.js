/**
 * 模块功能： 服务器分配
 * @param {*} app 
 */

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * 新的客户端接入进来
 * New client entry chat server.
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;

	//房间玩家进入的房间id
	var rid = msg.rid;

	//用户名字 + '*' + rid 组成用户的唯一标示uid
	var uid = msg.username + '*' + rid;

	//用户会话服务
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	//用户已经在聊天室中了，不可以重复进入
	if( !! sessionService.getByUid(uid)) {

		// 这个next得作用必然是：将当前状态返回给客户端，告诉他出现了500错误
		next(null, {
			code: 500,
			error: true
		});

		return;
	}

	//会话绑定uid作为唯一标示
	session.bind(uid);

	//房间id
	session.set('rid', rid); 

	//
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});

	//会话关闭
	session.on('closed', onUserLeave.bind(null, self.app));

	/**
	 * put user into channel
	 * .chat???从哪里来
	 * ChatRemote.prototype.add = function(uid, sid, name, flag, cb) 为何和chatRemote中的参数对不上呢？？？
	 */
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
			users:users  //客户端在登录服务器成功后，返回给客户端所有玩家列表
		});
	});
};

/**
 * 用户断线
 * User log out handler
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}

	//和服务器定义的方法: ChatRemote.prototype.kick = function(uid, sid, name, cb) ??? 参数为何对不上
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};