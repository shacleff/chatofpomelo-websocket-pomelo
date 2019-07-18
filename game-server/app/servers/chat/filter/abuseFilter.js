module.exports = function(){
    return new Filter();
};

var Filter = function(){
    
};

// 前置过滤器.得到用户的发言，进行处理
Filter.prototype.before = function(msg, session, next){
    if(msg.content.indexOf('fuck') !== -1){
        // 做一个标志位，可行吗？
        session.__abuse__ = true;
        msg.content = msg.content.replace('fuck', '***');
    }
    next();
}

// 后置过滤器, 做一下清理这里可以做一些清理工作
Filter.prototype.after = function(err, msg, session, resp, next){

    // 因为调用一个filter的before完，会立马调用after，所以这个__abuse__字段before中有，那么在这里就会检测到
    if(session.__abuse__){
        var user_info = session.uid.split('*'); //uid的组成-->username + '*' + rid
    }
    next(err);
};



