//
var pomelo = window.pomelo;

//用户自己的名字
var username;

//用户自己所在的房间id
var rid;

//所有用户组成的一个数组
var users;

//
var base = 1000;

//
var increase = 25;

//检查命名规则的正则
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

// 
var LOGIN_ERROR = "There is no server to log in, please wait.";

// 输入名字过短提示
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";

// 名字错误(比如以‘*’开头就不对) 或者 这个名字已经有人登录过了
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";

//
var DUPLICATE_ERROR = "Please change your name to login.";

util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},

	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
			n = '0' + n;
		return n;
	},

	// 玩家说一句话的时间
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//
	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

//
/**
 * 说完话后，滚到到滑动条最底端
 */
function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};

/**
 * 添加一条聊天消息到聊天列表中
 */
function addMessage(from, target, text, time) {

	//说的人的名字，是广播，还是给具体某个人说话
	var name = (target == '*' ? 'all' : target);

	//玩家发言输入文本内容为空
	if(text === null){
		return;
	}

	//没有传递时间参数
	if(time == null) {
		// if the time is null or undefined, use the current time.
		time = new Date();
	} 
	// 传递时间参数有误
	else if((time instanceof Date) === false) {
		// if it's a timestamp, interpret it
		time = new Date(time);
	}

	//every message you see is actually a table with 3 cols:
	//  the time,
	//  the person who caused the event,
	//  and the content
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");

	// sanitize
	//
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);

	//增加一条聊天记录
	$("#chatHistory").append(messageElement);

	//
	base += increase;
	
	//增加万一条记录，将滚动条滚到底部
	scrollDown(base);
};

// 弹框提示
function tip(type, name) {

	//tip弹框提示具体内容
	var tip;

	//提示的标题
	var title;

	//
	switch(type){

		//在线
		case 'online':
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		
		//离线
		case 'offline':
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		
		//发送了一条消息
		case 'message':
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}

	//
	var pop = new Pop(title, tip);
};

// 初始化用户列表
function initUserList(data) {
	// $("#usersList").clear(); //不行？

	users = data.users;
	for(var i = 0; i < users.length; i++) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", users[i]);
		slElement.text(users[i]);
		$("#usersList").append(slElement);
	}
};

// 用户列表里面添加一个人
function addUser(user) {
	var slElement = $(document.createElement("option"));
	slElement.attr("value", user);
	slElement.text(user);
	$("#usersList").append(slElement);
};

// 移除一个用户
function removeUser(user) {
	$("#usersList option").each(
		function() {
			if($(this).val() === user) $(this).remove();
	});
};

// 修改我的名字
function setName() {
	$("#name").text(username);
};

// 修改所在的房间rid
function setRoom() {
	$("#room").text(rid);
};

// 有错误，给个提示
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// 展示登录面板
function showLogin() {
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

// 展示聊天面板
function showChat() {
	$("#loginView").hide();
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

// 玩家进来时，pomelo服务器尝试分配一个connector服务器
function queryEntry(uid, callback) {

	//远程调用服务器接口，
	var route = 'gate.gateHandler.queryEntry';

	// 连接网关，端口配置在servers.json中
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			
			//先断开一下连接
			pomelo.disconnect();

			/**
			 * 服务器返回错误码500表示有错误。 
			 * 比如：1.uid错误   
			 *      2.没有可用connector服务器
			 */
			if(data.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}

			//登录成功，也就是服务器给这个新进入的客户端分配一个connector成功
			callback(data.host, data.port);
		});
	});
};

//
$(document).ready(function() {
	//首次进入，展示登录面板
	showLogin();

	//有人发送了一条聊天消息
	pomelo.on('onChat', function(data) {

		addMessage(data.from, data.target, data.msg);

		$("#chatHistory").show();

		//
		if(data.from !== username){
			tip('message', data.from);
		}
	});

	//有新的用户进来了
	pomelo.on('onAdd', function(data) {
		var user = data.user;
		tip('online', user);
		addUser(user);
	});

	//有用户离开了
	pomelo.on('onLeave', function(data) {
		var user = data.user;
		tip('offline', user);
		removeUser(user);
	});


	// 自己和pomelo服务器断开了连接
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

	//deal with login button click.
	$("#login").click(function() {
		username = $("#loginUser").attr("value");
		rid = $('#channelList').val();

		//用户名字 或者 房间id长度不符合要求 (0 < length <= 20 )
		if(username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
			showError(LENGTH_ERROR);
			return false;
		}

		//名字命名不符合规则
		if(!reg.test(username) || !reg.test(rid)) {
			showError(NAME_ERROR);
			return false;
		}

		//名字和房间id都符合规则，pomelo服务器开始分配一个
		queryEntry(username, function(host, port) {
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, function() {
				
				//这里拼错会导致进入房间失败
				var route = "connector.entryHandler.enter";

				//
				pomelo.request(route, {   //handler.enter = function(msg, session, next)   这个{}对象里面的内容对应的人就是msg的内容. 服务器端的next就是用来通知，并且回调客户端传过来的回调函数的，比如：告诉客户端所有玩家列表
					username: username,
					rid: rid
				}, function(data) {

					//服务端发现有错误。  route是客户端定义的。比如没有这个函数
					if(data.error) {
						showError(DUPLICATE_ERROR);
						return;
					}

					//设置自己的名字
					setName();

					//设置房间
					setRoom();

					//初始化聊天室列表
					showChat();

					//通过服务器返回的所有玩家列表，初始化一下客户端玩家列表
					initUserList(data);
				});
			});
		});
	});

	// 处理玩家聊天输入
	$("#entry").keypress(function(e) {

		//调用服务端发送消息的接口
		var route = "chat.chatHandler.send";

		//获取到选择的谁，向谁发送的
		var target = $("#usersList").val();

		//监听回车键
		if(e.keyCode != 13){
			return;
		} 

		//获取玩家输入的内容
		var msg = $("#entry").attr("value").replace("\n", "");

		//输入的有内容
		if(!util.isBlank(msg)) {

			//请求服务器发送消息接口，
			pomelo.request(route, {
				rid: rid,
				content: msg,
				from: username,
				target: target
			}, function(data) {

				//点击发送完毕，则清空聊天输入框
				$("#entry").attr("value", ""); // clear the entry field.

				//发送给的人不可以是 ‘*’ 不可以是自己名字
				if(target != '*' && target != username) {
					
					//添加一条消息
					addMessage(username, target, msg);

					//更新聊天框消息视图
					$("#chatHistory").show();
				}
			});
		}
	});
});