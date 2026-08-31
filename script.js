const snakes = { 31: 9, 38: 20, 84: 28, 98: 40, 62: 18 };
const ladders = { 3: 22, 8: 26, 14: 70, 28: 84, 50: 91 };

let numPlayers = 2;
let positions = [1, 1, 1, 1];
let currentPlayer = 0;
let isRolling = false;

function initBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  for (let row = 9; row >= 0; row--) {
    let isEven = (9 - row) % 2 === 1;
    for (let col = 0; col < 10; col++) {
      let cellNum = row * 10 + (isEven ? (10 - col) : (col + 1));
      const cell = document.createElement('div');
      cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'blue'}`;
      cell.innerText = cellNum;
      cell.id = `cell-${cellNum}`;
      board.appendChild(cell);
    }
  }
  createPlayers();
  drawConnections();
}

function createPlayers() {
  const layer = document.getElementById('players-layer');
  layer.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const p = document.createElement('div');
    p.className = `player p-${i}`;
    p.id = `player-${i}`;
    layer.appendChild(p);
  }
  updatePositions();
  updateTurnUI();
}

function getCoords(num) {
  const cell = document.getElementById(`cell-${num}`);
  if(!cell) return {x: 0, y: 0};
  const rect = cell.getBoundingClientRect();
  const parent = document.getElementById('board').getBoundingClientRect();
  return { x: rect.left - parent.left + rect.width/2, y: rect.top - parent.top + rect.height/2 };
}

function drawConnections() {
  const svg = document.getElementById('svg-layer');
  svg.innerHTML = '';

  const drawLine = (from, to, color, isSnake) => {
    const p1 = getCoords(from);
    const p2 = getCoords(to);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    
    if(isSnake) {
      let midX = (p1.x + p2.x)/2 + 20;
      let midY = (p1.y + p2.y)/2;
      d = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;
    }

    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', isSnake ? '7' : '8');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    if(!isSnake) path.setAttribute('stroke-dasharray', '4,3'); // মইয়ের মতো দেখানোর ড্যাশ

    svg.appendChild(path);
  };

  Object.entries(snakes).forEach(([from, to]) => drawLine(from, to, '#ff1744', true));  // লাল দাগ = সাপ
  Object.entries(ladders).forEach(([from, to]) => drawLine(from, to, '#00e676', false)); // সবুজ ড্যাশ = মই
}

function updatePositions() {
  for (let i = 0; i < numPlayers; i++) {
    const coords = getCoords(positions[i]);
    const p = document.getElementById(`player-${i}`);
    if(p) {
      p.style.left = `${coords.x - 9 + (i * 3)}px`;
      p.style.top = `${coords.y - 9 + (i * 2)}px`;
    }
  }
}

function rollDice(pIndex) {
  if (pIndex !== currentPlayer || isRolling) return;
  isRolling = true;

  const dice = document.getElementById(`dice-${pIndex}`);
  const diceVal = Math.floor(Math.random() * 6) + 1;

  // ৩ডি ঘোরা ঘূর্ণন
  const xRot = Math.floor(Math.random() * 4 + 4) * 360;
  const yRot = Math.floor(Math.random() * 4 + 4) * 360;
  dice.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg)`;

  setTimeout(() => {
    if (positions[currentPlayer] + diceVal <= 100) {
      positions[currentPlayer] += diceVal;
    }
    updatePositions();

    setTimeout(() => {
      let currPos = positions[currentPlayer];
      if (snakes[currPos]) positions[currentPlayer] = snakes[currPos];
      if (ladders[currPos]) positions[currentPlayer] = ladders[currPos];

      updatePositions();

      if (positions[currentPlayer] === 100) {
        alert(`অভিনন্দন! প্লেয়ার ${currentPlayer + 1} জিতে গেছেন!`);
        resetGame();
        return;
      }

      currentPlayer = (currentPlayer + 1) % numPlayers;
      updateTurnUI();
      isRolling = false;
    }, 400);

  }, 800);
}

function updateTurnUI() {
  document.querySelectorAll('.player-slot').forEach((el, idx) => {
    if(idx === currentPlayer) el.classList.add('active');
    else el.classList.remove('active');
  });
  document.getElementById('turn-text').innerText = `প্লেয়ার ${currentPlayer + 1}-এর দান`;
}

function resetGame() {
  numPlayers = parseInt(document.getElementById('player-count').value);
  positions = [1, 1, 1, 1];
  currentPlayer = 0;
  isRolling = false;

  document.getElementById('slot-p2').style.display = numPlayers >= 3 ? 'flex' : 'none';
  document.getElementById('slot-p3').style.display = numPlayers === 4 ? 'flex' : 'none';

  createPlayers();
}

initBoard();
window.onresize = () => { updatePositions(); drawConnections(); };
