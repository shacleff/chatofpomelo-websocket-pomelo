/**
 * 模块功能： 服务器分配
 * 理解前端服务器和后端服务器的配合:
 * 		entryHandler作为前端服务器，比如当玩家进入一个channel成功后,需要往channel中添加人，因此可以通过rpc
 * 		调用remote下面的接口。比如add
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

	//用户会话服务: session组件和connector组件相关 加载完session组件后，会生成这个session，用于维护客户端的连接信息
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

	//-----用户登录成功，下面进行session和用户的绑定操作-----

	//会话绑定uid作为唯一标示
	session.bind(uid);

	//房间id
	session.set('rid', rid); 

	//这里不push的话，对BackendSession的属性的修改，只在后端服务器的处理链中后面部分有效，而不对其它任何地方的Session产生影响
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
	 * 
	 * 核心流程第二步：客户端连接connector服务器，connector将新登录进来的额用户添加到channel里，通知channel里的所有用户，并通过ChatRemote的add方法的返回值，返回该channel的所有用户名字
	 * 
	 * var param = {
	 *    route: 'onAdd',
	 *	  user: username
	 * };
	 * 
	 * 通过这个'onAdd'事件，
	 * 通过这个方法，channel.pushMessage(param); 广播给所有channel里的用户，user列表,客户端得到后，刷新用户列表,客户端调用的方法如下：
	 * 
	 * pomelo.on('onAdd', function(data) {
	 *	 var user = data.user;
	 *	 tip('online', user);
	 *	 addUser(user);
	 * });
	 * 
	 */

	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){

		console.info("-----玩家进入聊天服务器,获取用户列表:" + JSON.stringify(users));

		next(null, {
			users:users  //客户端在登录服务器成功后，返回给客户端所有玩家列表
		});
	});

	
};

/**
 * 用户断线
 * 理解：
 * 	entryHandler作为前端服务器，当玩家离线时，需要将自己从服务器中移除掉，因此可以调用remote方法来移除自己
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

	console.info("-----session断开，connector服务器 踢掉用户, session.uid:" + session.uid 
																		 + " app.get('serverId'):" + app.get('serverId') 
																		 + " session.get('rid'):" + session.get('rid'));

	//踢人的操作，是需要后端服务器做一定逻辑，但是前端服务器监听到，因此必须在前端服务器 通过rpc调用 应用服务器完成清理操作。

	// rpc代理对象存在app.rpc下，由proxy组件实现。 rpc client生成的代理对象挂载在app.rpc下
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};