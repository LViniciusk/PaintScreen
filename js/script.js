







const screen = document.querySelector('#screen');
const context = screen.getContext('2d');


const pencil = {
    startPos: null,
    prePos: null,
    pos: {
        x: 0,
        y: 0
    },
    color: 'black',
    lineWidth: 4,
    isDrawing: false,
    moving: false,
}

let lines = [];

function resizeCanvas() {
    screen.width = (80 / 100) * window.innerWidth;
    screen.height = 600;
    context.lineWidth = pencil.lineWidth;
    context.strokeStyle = pencil.color;
    updateCursorPositions();
    redrawLines();
}

function redrawLines() {
    lines.forEach(line => {
        context.beginPath();
        context.moveTo(line.prePos.x, line.prePos.y);
        context.lineTo(line.pos.x, line.pos.y);
        context.stroke();
    });
}

// Atualiza a posição do cursor com base na nova posição e tamanho do canvas
function updateCursorPositions() {
    const sLeft = screen.getBoundingClientRect().left;
    const sTop = screen.getBoundingClientRect().top;

    screen.onmousemove = function (e) {
        pencil.pos.x = e.clientX - sLeft;
        pencil.pos.y = e.clientY - sTop;
        pencil.moving = true;
    }
}


function drawLine(line) {
    context.beginPath();
    context.moveTo(line.prePos.x, line.prePos.y);
    context.lineTo(line.pos.x, line.pos.y);
    context.stroke();
}

function drawCircle(startPos) {
    console.log("drawBall")
    const radius = 20; 
    context.beginPath();
    context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
    context.fillStyle = pencil.color;
    context.stroke();
}


screen.onmousedown = function (e) {
    pencil.isDrawing = true;
    pencil.startPos = { ...pencil.pos };
}
screen.onmouseup = function (e) {
    pencil.isDrawing = false;
}
screen.onmousemove = function (e) {
    pencil.pos.x = e.clientX - sLeft;
    pencil.pos.y = e.clientY - sTop;
    pencil.moving = true;
}

function cicle() {
    if (pencil.isDrawing && pencil.moving && pencil.prePos) {
        let line = {
            prePos: { ...pencil.prePos },
            pos: { ...pencil.pos }
        }
        drawLine(line);
        lines.push(line);
        pencil.moving = false;
    }
    pencil.prePos = { ...pencil.pos };

    setTimeout(cicle, 10);
}


window.onload = resizeCanvas;
window.onresize = resizeCanvas;
cicle();


