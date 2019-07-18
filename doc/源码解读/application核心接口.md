# 1.app.configure
```
/**
 * @param {String} env application environment
 * @param {Function} fn callback function
 * @param {String} type server type
 * @return {Application} for chaining
 * @memberOf Application
 */
Application.configure = function (env, type, fn) {
  var args = [].slice.call(arguments);
  fn = args.pop();
  env = type = Constants.RESERVED.ALL;

  if(args.length > 0) {
    env = args[0];
  }
  if(args.length > 1) {
    type = args[1];
  }

  if (env === Constants.RESERVED.ALL || contains(this.settings.env, env)) {
    if (type === Constants.RESERVED.ALL || contains(this.settings.serverType, type)) {
      fn.call(this);
    }
  }
  return this;
};
```
# 2.app.set
```
/**
 * @param {String} setting the setting of application
 * @param {String} val the setting's value
 * @param {Boolean} attach whether attach the settings to application
 * @return {Server|Mixed} for chaining, or the setting value
 * @memberOf Application
 */
Application.set = function (setting, val, attach) {
  if (arguments.length === 1) {
    return this.settings[setting];
  }
  this.settings[setting] = val;
  if(attach) {
    this[setting] = val;
  }
  return this;
};
```
# 3.app.route
```
/**
 * Set the route function for the specified server type.
 *
 * Examples:
 *
 *  app.route('area', routeFunc);
 *
 *  var routeFunc = function(session, msg, app, cb) {
 *    // all request to area would be route to the first area server
 *    var areas = app.getServersByType('area');
 *    cb(null, areas[0].id);
 *  };
 *
 * @param  {String} serverType server type string
 * @param  {Function} routeFunc  route function. routeFunc(session, msg, app, cb)
 * @return {Object}     current application instance for chain invoking
 * @memberOf Application
 */
Application.route = function(serverType, routeFunc) {
  var routes = this.get(Constants.KEYWORDS.ROUTE);
  if(!routes) {
    routes = {};
    this.set(Constants.KEYWORDS.ROUTE, routes);
  }
  routes[serverType] = routeFunc;
  return this;
};
```
# 4.app.filter
```
/**
 * add a filter to before and after filter
 *
 * @param {Object} filter provide before and after filter method.
 *                        A filter should have two methods: before and after.
 * @memberOf Application
 */
Application.filter = function (filter) {
  this.before(filter);
  this.after(filter);
};
```
# 5.app.start
```
/**
 * Start application. It would load the default components and start all the loaded components.
 *
 * @param  {Function} cb callback function
 * @memberOf Application
 */
 Application.start = function(cb) {
  this.startTime = Date.now();
  if(this.state > STATE_INITED) {
    utils.invokeCallback(cb, new Error('application has already start.'));
    return;
  }
  
  var self = this;
  appUtil.startByType(self, function() {
    appUtil.loadDefaultComponents(self);
    var startUp = function() {
      appUtil.optComponents(self.loaded, Constants.RESERVED.START, function(err) {
        self.state = STATE_START;
        if(err) {
          utils.invokeCallback(cb, err);
        } else {
          logger.info('%j enter after start...', self.getServerId());
          self.afterStart(cb);
        }
      });
    };
    var beforeFun = self.lifecycleCbs[Constants.LIFECYCLE.BEFORE_STARTUP];
    if(!!beforeFun) {
      beforeFun.call(null, self, startUp);
    } else {
      startUp();
    }
  });
};
```
# 6.app.registerAdmin
```
/**
 * Register admin modules. Admin modules is the extends point of the monitor system.
 *
 * @param {String} module (optional) module id or provoided by module.moduleId
 * @param {Object} module module object or factory function for module
 * @param {Object} opts construct parameter for module
 * @memberOf Application
 */
Application.registerAdmin = function(moduleId, module, opts) {
  var modules = this.get(Constants.KEYWORDS.MODULE);
  if(!modules) {
    modules = {};
    this.set(Constants.KEYWORDS.MODULE, modules);
  }

  if(typeof moduleId !== 'string') {
    opts = module;
    module = moduleId;
    if(module) {
      moduleId = module.moduleId;
    }
  }

  if(!moduleId){
    return;
  }

  modules[moduleId] = {
    moduleId: moduleId,
    module: module,
    opts: opts
  };
};
```
# 7.app.load
```
/**
 * Load component
 *
 * @param  {String} name    (optional) name of the component
 * @param  {Object} component component instance or factory function of the component
 * @param  {[type]} opts    (optional) construct parameters for the factory function
 * @return {Object}     app instance for chain invoke
 * @memberOf Application
 */
Application.load = function(name, component, opts) {
  if(typeof name !== 'string') {
    opts = component;
    component = name;
    name = null;
    if(typeof component.name === 'string') {
      name = component.name;
    }
  }

  if(typeof component === 'function') {
    component = component(this, opts);
  }

  if(!name && typeof component.name === 'string') {
    name = component.name;
  }

  if(name && this.components[name]) {
    // ignore duplicat component
    logger.warn('ignore duplicate component: %j', name);
    return;
  }

  this.loaded.push(component);
  if(name) {
    // components with a name would get by name throught app.components later.
    this.components[name] = component;
  }

  return this;
};
```