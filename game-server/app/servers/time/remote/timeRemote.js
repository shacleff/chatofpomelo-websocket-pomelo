module.exports = function(app){
    return new TimeRemote(app);
};

var TimeRemote = function(app){
    this.app = app;
    this.channelService = app.get('channelService');
};

TimeRemote.prototype.getCurrentTime = function(arg1, arg2, cb){
    var d = new Date();
    var hour = d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    cb(hour, min, sec);
};
