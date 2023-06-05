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