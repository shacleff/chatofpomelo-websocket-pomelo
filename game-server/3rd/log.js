/**
 * 功能： 存放异步的日志文件工具类
 *     1) 从这个log文件，总结出以下知识点：require过的文件，require不会再次被加载，也就是里面声明过的变量，不会重新初始化。
 *     2）这样在一个文件内的全局变量，相当于这个模块的“数据成员”   里面操作这些成员的函数相当于：“成员函数”
 *     3）当然了，整个文件相当于一个已经实例化过的单例类
 *
 *     输出日志核心：process.stdout.write
 */

var util = require('util');

/**
 * 功能：日志等级
 */
var LEVEL = {
    ALL: Infinity,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    NONE: -Infinity
};

/**
 * 功能：设置日志输出时的颜色
 */
var COLOR = {
    RESET: '\u001b[0m',
    INFO:  '\u001b[32m', // green   绿
    WARN:  '\u001b[33m', // yellow  黄
    ERROR: '\u001b[31m'  // red     红
}

/**
 * 功能：全局日志等级，小于这个等级的才可以被输出, 因此可以方便的关闭日志
 *     1）NONE 则没有输出了
 *     2) ALL 任意纸质都可以输出
 *     3）其它 小于等于这个，才会输出
 */
var globalLevel = LEVEL.ALL;

/**
 * 是否输出应该被染色
 *     1）true 根据日志等级正常染色
 *     2）false 不再染色
 */
var coloredOutput = true;

function setLevel(level) {
    globalLevel = level;
}

function setColoredOutput(bool) {
    coloredOutput = bool;
}

function info() {
    if (LEVEL.INFO <= globalLevel) {
        log(LEVEL.INFO, util.format.apply(null, arguments));
        // log(LEVEL.INFO, util.format(arguments));
    }
}

function warn() {
    if (LEVEL.WARN <= globalLevel) {
        log(LEVEL.WARN, util.format.apply(null, arguments));
    }
}

function error() {
    if (LEVEL.ERROR <= globalLevel) {
        log(LEVEL.ERROR, util.format.apply(null, arguments));
    }
}

function newPrepareStackTrace(error, structuredStack) {
    return structuredStack;
}

/**
 * 功能：根据日志等级，输出日志
 * must not be called directly due to stack trace
 * @param level
 * @param message
 */
function log(level, message) {
    // get call stack and find the caller
    var oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = newPrepareStackTrace;

    //
    var structuredStack = new Error().stack;
    Error.prepareStackTrace = oldPrepareStackTrace;


    var caller = structuredStack[2];

    /**
     * 功能：不同平台文件连接符
     *     1）windows \\
     *     2）linux /
     */
    var lineSep = process.platform == 'win32' ? '\\' : '/';

    var fileNameSplited = caller.getFileName().split(lineSep);

    // 文件名字
    var fileName = fileNameSplited[fileNameSplited.length - 1];

    // 所在行
    var lineNumber = caller.getLineNumber();

    // 所在列
    var columnNumber = caller.getColumnNumber();

    // function name may be empty if it is a global call
    // var functionName = caller.getFunctionName();
    var levelString;

    switch (level) {
        case LEVEL.INFO:
            levelString = '[INFO]';
            break;
        case LEVEL.WARN:
            levelString = '[WARN]';
            break;
        case LEVEL.ERROR:
            levelString = '[ERROR]';
            break;
        default:
            levelString = '[]';
            break;
    }

    //
    var output = util.format('%s %s(%d,%d) %s', levelString, fileName, lineNumber, columnNumber, message);

    // 没有染色
    if (!coloredOutput) {

        process.stdout.write(output + '\n');

    } else { //　染色了

        switch (level) {
            case LEVEL.INFO:
                process.stdout.write(COLOR.INFO + output + COLOR.RESET + '\n');
                break;

            case LEVEL.WARN:
                process.stdout.write(COLOR.WARN + output + COLOR.RESET + '\n');
                break;

            case LEVEL.ERROR:
                process.stdout.write(COLOR.ERROR + output + COLOR.RESET + '\n');
                break;
            default:
                break;
        }
    }
}


module.exports = {
    info: info,
    warn: warn,
    error: error,
    LEVEL: LEVEL,
    setLevel: setLevel,
    setColoredOutput: setColoredOutput
};