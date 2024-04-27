const screen = document.querySelector('#screen');
const context = screen.getContext('2d');

const pencil = {
    startPos: null,
    prePos: null,
    pos: { x: 0, y: 0 },
    color: 'black',
    lineWidth: 4,
    isDrawing: false,
    moving: false,
}

let lines = [];
let animationFrameId = null;

function resizeCanvas() {
    screen.width = window.innerWidth * 0.8;
    screen.height = 600;
    context.lineWidth = pencil.lineWidth;
    context.strokeStyle = pencil.color;
    redrawLines();
}

function redrawLines() {
    context.clearRect(0, 0, screen.width, screen.height); // Clear the canvas
    lines.forEach(line => {
        context.beginPath();
        context.moveTo(line.prePos.x, line.prePos.y);
        context.lineTo(line.pos.x, line.pos.y);
        context.stroke();
    });
}

screen.onmousedown = function (e) {
    pencil.isDrawing = true;
    const {left, top} = screen.getBoundingClientRect();
    pencil.startPos = { x: e.clientX - left, y: e.clientY - top };
    pencil.prePos = { ...pencil.startPos };
    lines = []; // Start a new drawing
}

screen.onmouseup = function (e) {
    pencil.isDrawing = false;
    setTimeout(transformLinesToCircle, 2000);
    
}

screen.onmousemove = function (e) {
    if (pencil.isDrawing) {
        const {left, top} = screen.getBoundingClientRect();
        pencil.pos.x = e.clientX - left;
        pencil.pos.y = e.clientY - top;
        if (pencil.moving) {
            const line = {
                prePos: { ...pencil.prePos },
                pos: { ...pencil.pos }
            };
            drawLine(line);
            lines.push(line);
        }
        pencil.prePos = { ...pencil.pos };
        pencil.moving = true;
    }
}

function drawLine(line) {
    context.beginPath();
    context.moveTo(line.prePos.x, line.prePos.y);
    context.lineTo(line.pos.x, line.pos.y);
    context.stroke();
}

function transformLinesToCircle() {
    const center = lines.reduce((acc, line) => {
        acc.x += (line.prePos.x + line.pos.x) / 2;
        acc.y += (line.prePos.y + line.pos.y) / 2;
        return acc;
    }, { x: 0, y: 0 });

    center.x /= lines.length;
    center.y /= lines.length;

    const radius = lines.reduce((max, line) => {
        const dist = Math.sqrt(Math.pow(line.pos.x - center.x, 2) + Math.pow(line.pos.y - center.y, 2));
        return Math.max(max, dist);
    }, 0);

    let angle = 0;
    const angleIncrement = (2 * Math.PI) / lines.length;

    cancelAnimationFrame(animationFrameId);
    animateLinesToCircle(center, radius, angle, angleIncrement);
}

function animateLinesToCircle(center, radius, angle, angleIncrement) {
    context.clearRect(0, 0, screen.width, screen.height); // Clear the canvas
    let isAnimationComplete = true;

    context.beginPath();  // Begin a new path for the circle

    lines.forEach((line, index) => {
        const targetX = center.x + radius * Math.cos(angle + index * angleIncrement);
        const targetY = center.y + radius * Math.sin(angle + index * angleIncrement);

        // Check if the line has reached close enough to the target position
        if (Math.abs(line.pos.x - targetX) > 0.5 || Math.abs(line.pos.y - targetY) > 0.5) {
            isAnimationComplete = false;
        }

        // Interpolate current position towards the target position
        line.pos.x += (targetX - line.pos.x) * 0.01;
        line.pos.y += (targetY - line.pos.y) * 0.01;

        // If it's the first point, move to it without drawing a line
        if (index === 0) {
            context.moveTo(line.pos.x, line.pos.y);
        } else {
            context.lineTo(line.pos.x, line.pos.y);
        }
    });

    context.closePath(); // Close the path of the circle
    context.stroke(); // Draw the circle

    if (!isAnimationComplete) {
        animationFrameId = requestAnimationFrame(() => animateLinesToCircle(center, radius, angle, angleIncrement));
    } else {
        redrawFinalCircle(); // Redraw the final circle to ensure it stays
    }
}
function redrawFinalCircle() {
    context.beginPath();
    lines.forEach((line, index) => {
        if (index === 0) {
            context.moveTo(line.pos.x, line.pos.y);
        } else {
            context.lineTo(line.pos.x, line.pos.y);
        }
    });
    context.closePath();
    context.stroke();
}

window.onload = resizeCanvas;
window.onresize = resizeCanvas;
