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
const intervals = [];

let time = 0;
let framesDrawn = 0;

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
    setInterval(() => {
        s.position.x = (s.position.x + 1) % cw;
    }, 10);
})

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");
    const fpsDom = document.getElementById("fps");
    const ctx = canvas.getContext("2d");
    const fps = 60;
    setInterval(draw.bind(null, ctx), 1000 / fps);
    setInterval(() => {
        fpsDom.innerText = framesDrawn;
        framesDrawn = 0;
    }, 1000);
});