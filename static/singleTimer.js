(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this)}).call(this,require('_process'))
},{"_process":3}],2:[function(require,module,exports){
const requestAnimationFrame = require("raf");
const now = require("performance-now");

/**
 * @typedef {Object} TimeoutConfiguration
 * @property {boolean} cancelled
 * @property 
 */

class TimeoutController {
    /**
     * @param {TimeoutConfiguration} config 
     */
    constructor(config) {
        this.config = config;
    }
    cancel() {
        this.config.cancelled = true;
    }
}

/**
 * Executes callback for only once after specified delay in milliseconds
 * @param {Number} milliseconds Delay time in milliseconds
 * @param {Function} callback Function which will be executed after delay time
 * @param {IntervalConfiguration | TimeoutConfiguration} config Don't set this parameter manually
 * @return {TimeoutController}
 */
function prcTimeout(milliseconds, callback, config = { cancelled: false }) {
    const executeAfter = now() + milliseconds;
    requestAnimationFrame((ts) => tick(ts, executeAfter, callback, false, config));
    return new TimeoutController(config);
}

/**
 * Executes callback for only once after specified delay in milliseconds
 * @param {Number} milliseconds Delay time in milliseconds
 * @param {Function} callback Function which will be executed after delay time
 * @param {IntervalConfiguration} config Don't set this parameter manually
 * @return {TimeoutController}
 */
function prcTimeoutWithDelta(milliseconds, callback, config = { cancelled: false, lastCallTimestamp: 0 }) {
    const executeAfter = now() + milliseconds;
    requestAnimationFrame(ts => tick(ts, executeAfter, callback, true, config));
    return new TimeoutController(config);
}

/**
 * @typedef {Object} IntervalConfiguration
 * @property {boolean} cancelled Tells interval to execute callback at next tick. If once set to false, interval will be permanently deleted.
 * @property {boolean} interval Defines period in milliseconds.
 * @property {number} lastCallTimestamp Timestamp of last tick
 * @property {Function} callback Only getter for callback function of interval.
 */

class IntervalController {
    /**
     * @param {IntervalConfiguration} config 
     * @param {boolean} hasDelta
     */
    constructor(config, hasDelta) {
        this.config = config;
        this.callback = config.callback;
        this.hasDelta = hasDelta;
    }

    restart() {
        this.config.cancelled = true;
        if (this.hasDelta) {
            const newInterval = prcIntervalWithDelta(this.config.interval, this.config.callback);
            this.config = newInterval.config;
        } else {
            const newInterval = prcInterval(this.config.interval, this.config.callback);
            this.config = newInterval.config;
        }
    }

    cancel() {
        this.config.cancelled = true;
    }

    pauseResume() {
        if (this.config.cancelled) {
            this.restart();
        } else {
            this.config.cancelled = true;
        }
    }

    setPeriod(milliseconds) {
        this.config.interval = milliseconds;
        this.restart();
    }

    getPeriod() {
        return this.config.interval;
    }

}

/**
 * 
 * @param {Number} milliseconds Delay time in milliseconds
 * @param {Function} callback Function which will be executed after delay time
 * @returns {IntervalController}
 */
function prcInterval(milliseconds, callback) {
    /** @type {IntervalConfiguration} */ let config = {
        cancelled: false,
        interval: milliseconds,
        callback: callback,
    };
    const configuredCallback = () => {
        callback();
        prcTimeout(milliseconds, configuredCallback, config);
    }
    prcTimeout(milliseconds, configuredCallback, config);
    return new IntervalController(config, false);
}

/**
 * 
 * @param {Number} milliseconds Delay time in milliseconds
 * @param {Function} callback Function which will be executed after delay time
 * @returns {IntervalConfiguration}
 */
function prcIntervalWithDelta(milliseconds, callback) {
    /** @type {IntervalConfiguration} */ let config = {
        cancelled: false,
        interval: milliseconds,
        callback: callback,
        lastCallTimestamp: 0
    };

    const configuredCallback = (deltaT) => {
        callback(deltaT);
        prcTimeoutWithDelta(milliseconds, configuredCallback, config);
    }
    prcTimeoutWithDelta(milliseconds, configuredCallback, config);
    return new IntervalController(config, true);
}

/**
 * @param {Number} timestamp Now
 * @param {Number} executeAfter Should call callback after this
 * @param {Function} callback Callback Function
 * @param {Boolean} bindDeltaT Bind delta time to callback function
 * @param {TimeoutConfiguration | IntervalConfiguration} config Interval or Timeout config
 */
function tick(timestamp, executeAfter, callback, bindDeltaT, config) {
    if (timestamp < executeAfter && !config.cancelled) {
        requestAnimationFrame((ts) => tick(ts, executeAfter, callback, bindDeltaT, config));
    } else if (!config.cancelled && bindDeltaT) {
        callback(timestamp - config.lastCallTimestamp);
        config.lastCallTimestamp = timestamp;
    } else if (!config.cancelled) {
        callback();
    }
}

module.exports = { prcTimeout, prcTimeoutWithDelta, prcInterval, prcIntervalWithDelta, IntervalController, TimeoutController };
},{"performance-now":1,"raf":4}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (global){(function (){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":1}],5:[function(require,module,exports){
const { prcIntervalWithDelta, prcInterval } = require("precision-timeout-interval");

/**
 * @typedef {Object} Vector2D
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} GeoNode
 * @property {Vector2D} position
 * @property {Vector2D} size
 * @property {string} color
 */

/**
 * @typedef {Object} VirtualInterval
 * @property {Function} callback
 * @property {number} timeToTick
 * @property {number} interval
 */

/**
 * @type {VirtualInterval[]}
 */
const virtualIntervals = [];

let time = 0;
let framesDrawn = 0;

/**
 * 
 * @param {number} delta 
 */
function update(delta) {
    virtualIntervals.forEach(i => {
        const timeRequired = time + i.timeToTick;
        // console.log("Time Required: %d\nTime+delta: %d", timeRequired, time+delta);
        if (time + delta >= timeRequired) {
            i.callback(delta);
            i.timeToTick = i.interval;
        } else {
            i.timeToTick -= delta;
        }
    });
}


const alphaNums = ["a", "b", "c", "d", "e", "f", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const randomAlphaNum = () => alphaNums[Math.floor(Math.random() * alphaNums.length)];
function randomColor() {
    return "#" + randomAlphaNum() + randomAlphaNum() + randomAlphaNum();
}

/**
 * @type {GeoNode[]}
 */
const squares = []
const cw = 1500;
const ch = 1500;

for (let i = 0; i < cw / 10; i++) {
    for (let j = 0; j < ch / 10; j++) {
        squares.push({
            color: randomColor(),
            position: { x: j * 10, y: i * 10 },
            size: { x: 10, y: 10 }
        })
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} canvaz 
 */
function draw(canvaz) {
    canvaz.fillStyle = "#000";
    canvaz.fillRect(0, 0, cw, ch);
    squares.forEach(s => {
        canvaz.fillStyle = s.color;
        canvaz.fillRect(s.position.x, s.position.y, s.size.x, s.size.y);
    });
    framesDrawn++;
}

squares.forEach(s => {
    virtualIntervals.push({
        callback: (deltaT) => {
            s.position.x = (s.position.x + (deltaT/10)) % cw;
        },
        interval: 10,
        timeToTick: 0
    })
});

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const fps = 60;
    const fpsDom = document.getElementById("fps");

    setInterval(draw.bind(null, ctx), 1000 / fps);
    prcIntervalWithDelta(10, update);
    prcInterval(1000, () => {
        fpsDom.innerText = framesDrawn;
        framesDrawn = 0;
    });
});
},{"precision-timeout-interval":2}]},{},[5]);
