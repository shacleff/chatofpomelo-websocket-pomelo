/**
 * 功能：聊天过滤器。 
 * 在用户发言前，将骂人的话，骂人的单词替换成***
 */

module.exports = function(){
    return new Filter();
}

//具体过滤器实现
var Filter = function(){
    
}

//前置过滤器.得到用户的发言，进行处理
Filter.prototype.before = function(msg, session, next){
    
    if(msg.content.indexOf('fuck') !== -1){

        //简单做一个标志，给后面的后置过滤器使用
        session.__abuse__ = true;

        //将一个字符串中指定单词替换掉
        msg.content = msg.content.replace('fuck', '***');
    }

    //下一个流程
    next();
}

//
Filter.prototype.after = function(err, msg, session, resp, next){

    if(session.__abuse__){

        //username + '*' + rid
        var user_info = session.uid.split('*');
        console.log('-----说脏话的人 username:' + user_info[0] + " at room:" + user_info[1]);
    }

    //下一个流程
    next(err);
}



