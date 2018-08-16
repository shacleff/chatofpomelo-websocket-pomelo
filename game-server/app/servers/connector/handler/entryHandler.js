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
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	//用户已经在聊天室中了，不可以重复进入
	if( !! sessionService.getByUid(uid)) {

		next(null, {
			code: 500,
			error: true
		});

		return;
	}

	session.bind(uid);
	session.set('rid', rid); 
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	//.chat???从哪里来
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
			users:users  //客户端在登录服务器成功后，返回给客户端所有玩家列表
		});
	});
};

/**
 * User log out handler
 *
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