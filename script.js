let position = 1;
let isRolling = false;

// সাপ (Snake) এবং সিঁড়ি (Ladder) এর সংযোগ
const snakes = { 31: 9, 38: 20, 84: 28, 98: 40 };
const ladders = { 3: 22, 8: 26, 14: 70, 28: 84 };

function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  for (let row = 9; row >= 0; row--) {
    let isEven = (9 - row) % 2 === 1;
    for (let col = 0; col < 10; col++) {
      let cellNum = row * 10 + (isEven ? (10 - col) : (col + 1));
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${cellNum}`;
      
      if (cellNum === position) {
        cell.innerHTML = `<div class="player">${cellNum}</div>`;
      } else {
        cell.innerText = cellNum;
      }
      board.appendChild(cell);
    }
  }
  drawConnections();
}

function rollDice() {
  if (isRolling) return;
  isRolling = true;

  const dice = document.getElementById('dice');
  const diceVal = Math.floor(Math.random() * 6) + 1;
  
  // ছক্কা ঘোরানোর অ্যানিমেশন
  const xRot = Math.floor(Math.random() * 4 + 4) * 360;
  const yRot = Math.floor(Math.random() * 4 + 4) * 360;
  dice.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg)`;

  setTimeout(() => {
    isRolling = false;
    if (position + diceVal <= 100) position += diceVal;
    if (snakes[position]) position = snakes[position];
    if (ladders[position]) position = ladders[position];
    
    createBoard();
    document.getElementById('player-pos').innerText = position;
    if (position === 100) alert('অভিনন্দন! আপনি জিতে গেছেন!');
  }, 1000);
}

// বোর্ড জুড়ে সাপ ও সিঁড়ির দাগ আঁকার ফাংশন
function drawConnections() {
  const svg = document.getElementById('svg-overlay');
  svg.innerHTML = '';
  
  const drawLine = (from, to, color) => {
    const el1 = document.getElementById(`cell-${from}`);
    const el2 = document.getElementById(`cell-${to}`);
    if (!el1 || !el2) return;

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const parent = svg.getBoundingClientRect();

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', r1.left + r1.width/2 - parent.left);
    line.setAttribute('y1', r1.top + r1.height/2 - parent.top);
    line.setAttribute('x2', r2.left + r2.width/2 - parent.left);
    line.setAttribute('y2', r2.top + r2.height/2 - parent.top);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '4');
    svg.appendChild(line);
  };

  Object.entries(snakes).forEach(([from, to]) => drawLine(from, to, '#ff4757')); // লাল দাগ = সাপ
  Object.entries(ladders).forEach(([from, to]) => drawLine(from, to, '#2ed573')); // সবুজ দাগ = সিঁড়ি
}

createBoard();
window.onresize = drawConnections;
