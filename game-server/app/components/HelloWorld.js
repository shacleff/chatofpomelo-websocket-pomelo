/**
 * 功能：每间隔5s执行一次的组件
 */
module.exports = function(app, opts){
    return new HelloWorld(app, opts);
}

var DEFAULT_INTERVAL = 3000;

var HelloWorld = function(app, opts){
    this.app = app;
    this.interval = opts.interval || DEFAULT_INTERVAL;
    this.timerId = null;
};

HelloWorld.name = '__HelloWorld__';

HelloWorld.prototype.start = function(cb){
    var self = this;
    this.timerId = setInterval(function(){
        console.info(self.app.getServerId() + " Hello World!");
    }, this.interval);

    process.nextTick(cb);
};

HelloWorld.prototype.afterStart = function(cb){
    process.nextTick(cb);
};

HelloWorld.prototype.stop = function(force, cb){
    clearInterval(this.timerId);
    process.nextTick(cb);
};






