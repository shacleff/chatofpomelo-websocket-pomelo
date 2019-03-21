var pomelo = window.pomelo;
var username; // 用户自己的名字
var rid;      // 用户自己所在的房间id
var users;    // 所有用户组成的一个数组
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/; // 检查命名规则的正则
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max."; // 输入名字过短提示
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'"; // 名字错误(比如以‘*’开头就不对) 或者 这个名字已经有人登录过了
var DUPLICATE_ERROR = "Please change your name to login.";

util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	toStaticHTML: function(inputHtml) { // html sanitizer
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},

	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
			n = '0' + n;
		return n;
	},

	timeString: function(date) { 	 // 玩家说一句话的时间
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	isBlank: function(text) { //does the argument only contain whitespace?
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

function scrollDown(base) { // 说完话后，滚到到滑动条最底端
	window.scrollTo(0, base);
	$("#entry").focus();
};

function addMessage(from, target, text, time) { // 添加一条聊天消息到聊天列表中
	var name = (target == '*' ? 'all' : target); // 说的人的名字，是广播，还是给具体某个人说话
	if(text === null){ 
		return;
	}

	if(time == null) {
		time = new Date();
	} else if((time instanceof Date) === false) {
		time = new Date(time);
	}
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);
	$("#chatHistory").append(messageElement); // 增加一条聊天记录
	base += increase;
	scrollDown(base); // 增加万一条记录，将滚动条滚到底部
};

// 弹框提示
function tip(type, name) {
	var tip;    // tip弹框提示具体内容
	var title; // 提示的标题
	switch(type){
		case 'online': // 在线
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		case 'offline': // 离线
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		case 'message': // 发送了一条消息
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}
	new Pop(title, tip);
};

function initUserList(data) { // 初始化用户列表
	// $("#usersList").clear(); //不行？
	users = data.users;
	for(var i = 0; i < users.length; i++) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", users[i]);
		slElement.text(users[i]);
		$("#usersList").append(slElement);
	}
};

function addUser(user) {  // 用户列表里面添加一个人
	var slElement = $(document.createElement("option"));
	slElement.attr("value", user);
	slElement.text(user);
	$("#usersList").append(slElement);
};

function removeUser(user) { // 移除一个用户
	$("#usersList option").each(
		function() {
			if($(this).val() === user) $(this).remove();
	});
};

function setName() { // 修改我的名字
	$("#name").text(username);
};

function setRoom() { // 修改所在的房间rid
	$("#room").text(rid);
};

function showError(content) { // 有错误，给个提示
	$("#loginError").text(content);
	$("#loginError").show();
};

function showLogin() { // 展示登录面板
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

function showChat() {  // 展示聊天面板
	$("#loginView").hide();
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

function queryEntry(uid, callback) {           // 玩家进来时，pomelo服务器尝试分配一个connector服务器
	var route = 'gate.gateHandler.queryEntry'; // 远程调用服务器接口
	pomelo.init({                              // 连接网关，端口配置在servers.json中
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect(); // 先断开一下连接
			if(data.code === 500) { // uid错误 或 没有可用connector服务器
				showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port); // 登陆成功分配新的connector host port
		});
	});
};

$(document).ready(function() {
	showLogin(); // 首次进入，展示登录面板
	
	pomelo.on('onChat', function(data) { // 有人发送了一条聊天消息
		addMessage(data.from, data.target, data.msg);
		$("#chatHistory").show();
		if(data.from !== username){
			tip('message', data.from);
		}
	});

	pomelo.on('onAdd', function(data) { // 有新的用户进来了
		var user = data.user;
		tip('online', user);
		addUser(user);
	});

	pomelo.on('onLeave', function(data) { //有用户离开了
		var user = data.user;
		tip('offline', user);
		removeUser(user);
	});

	pomelo.on('disconnect', function(reason) { 	// 自己和pomelo服务器断开了连接
		showLogin();
	});

	$("#login").click(function() {
		username = $("#loginUser").attr("value");
		rid = $('#channelList').val();
		if(username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
			showError(LENGTH_ERROR);
			return false;
		}

		if(!reg.test(username) || !reg.test(rid)) {
			showError(NAME_ERROR);
			return false;
		}

		queryEntry(username, function(host, port) { // 名字和房间id都符合规则，pomelo服务器开始分配一个
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, function() {
				var route = "connector.entryHandler.enter";
				pomelo.request(route, {   
					username: username,   
					rid: rid              
				}, function(data) {
					if(data.error) {
						showError(DUPLICATE_ERROR);
						return;
					}
					setName(); 
					setRoom();
					showChat();
					initUserList(data);
				});
			});
		});
	});

	$("#entry").keypress(function(e) {
		var route = "chat.chatHandler.send";
		var target = $("#usersList").val();
		if(e.keyCode != 13){
			return;
		} 
		var msg = $("#entry").attr("value").replace("\n", "");
		if(!util.isBlank(msg)) {
			pomelo.request(route, {
				rid: rid,
				content: msg,
				from: username,
				target: target
			}, function(data) {
				$("#entry").attr("value", ""); 			  // 清空聊天框
				if(target != '*' && target != username) { //发送给的人不可以是 ‘*’ 不可以是自己名字
					addMessage(username, target, msg);
					$("#chatHistory").show();
				}
			});
		}
	});
});