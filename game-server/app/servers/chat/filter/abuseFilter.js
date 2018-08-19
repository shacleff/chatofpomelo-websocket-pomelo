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

    /**
     * 下一个流程
     * 向后面传递具体的处理错误以及相应，在filter的实现中，在逻辑处理完后，必须调用filter，否则将打断整个处理链。
     * 
     * 有错误的话，可以在next(err, resp)这样调用。没有错误可以next(null, resp)
     * 
     */
    next();
}

//这里可以做一些清理工作
Filter.prototype.after = function(err, msg, session, resp, next){

    if(session.__abuse__){

        //username + '*' + rid
        var user_info = session.uid.split('*');
        console.log('-----说脏话的人 username:' + user_info[0] + " at room:" + user_info[1]);
    }

    /**
     * 下一个流程
     * 由于在执行after时，resp以及发送给了客户端了，所以处理链duierr不再敏感，无论是否有err，
     * 整个afterFilter链都会执行完毕
     */
    next(err);
}



