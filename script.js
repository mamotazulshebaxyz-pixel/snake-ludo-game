// ওভারল্যাপ ছাড়াই আলাদা আলাদা ঘরে সাপ ও মইয়ের পজিশন
const snakes = { 98: 40, 84: 58, 62: 19, 36: 6, 27: 5 };
const ladders = { 4: 25, 12: 50, 29: 74, 42: 81, 67: 88 };

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
  setTimeout(drawObjects, 100);
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
  if (!cell) return { x: 0, y: 0 };
  const rect = cell.getBoundingClientRect();
  const parent = document.getElementById('board').getBoundingClientRect();
  return { x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top + rect.height / 2 };
}

// সুন্দর গ্রাফিক্সের সাপ ও মই আঁকার ফাংশন
function drawObjects() {
  const svg = document.getElementById('svg-layer');
  svg.innerHTML = '';

  // মই আঁকা
  Object.entries(ladders).forEach(([from, to]) => {
    const p1 = getCoords(from);
    const p2 = getCoords(to);
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const perpX = Math.sin(angle) * 8;
    const perpY = -Math.cos(angle) * 8;

    // মইয়ের দুই পাশের রেলিং
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', p1.x + perpX); line1.setAttribute('y1', p1.y + perpY);
    line1.setAttribute('x2', p2.x + perpX); line1.setAttribute('y2', p2.y + perpY);
    line1.setAttribute('stroke', '#8d6e63'); line1.setAttribute('stroke-width', '4');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', p1.x - perpX); line2.setAttribute('y1', p1.y - perpY);
    line2.setAttribute('x2', p2.x - perpX); line2.setAttribute('y2', p2.y - perpY);
    line2.setAttribute('stroke', '#8d6e63'); line2.setAttribute('stroke-width', '4');

    svg.appendChild(line1); svg.appendChild(line2);

    // মইয়ের ধাপসমূহ
    const steps = Math.floor(len / 18);
    for (let i = 1; i < steps; i++) {
      const stepX = p1.x + (dx * (i / steps));
      const stepY = p1.y + (dy * (i / steps));
      const stepLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stepLine.setAttribute('x1', stepX + perpX); stepLine.setAttribute('y1', stepY + perpY);
      stepLine.setAttribute('x2', stepX - perpX); stepLine.setAttribute('y2', stepY - perpY);
      stepLine.setAttribute('stroke', '#d7ccc8'); stepLine.setAttribute('stroke-width', '3');
      svg.appendChild(stepLine);
    }
  });

  // সাপ আঁকা
  Object.entries(snakes).forEach(([from, to]) => {
    const head = getCoords(from);
    const tail = getCoords(to);

    const midX = (head.x + tail.x) / 2 + (head.x > tail.x ? 30 : -30);
    const midY = (head.y + tail.y) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${head.x} ${head.y} Q ${midX} ${midY} ${tail.x} ${tail.y}`);
    path.setAttribute('stroke', '#2e7d32');
    path.setAttribute('stroke-width', '10');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // সাপের চোখ
    const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye.setAttribute('cx', head.x); eye.setAttribute('cy', head.y);
    eye.setAttribute('r', '4'); eye.setAttribute('fill', '#d50000');
    svg.appendChild(eye);
  });
}

function updatePositions() {
  for (let i = 0; i < numPlayers; i++) {
    const coords = getCoords(positions[i]);
    const p = document.getElementById(`player-${i}`);
    if (p) {
      p.style.left = `${coords.x - 9 + (i * 3)}px`;
      p.style.top = `${coords.y - 9 + (i * 2)}px`;
    }
  }
}

function rollDice(pIndex) {
  if (pIndex !== currentPlayer || isRolling) return;
  isRolling = true;

  const btn = document.getElementById(`btn-p${pIndex}`);
  const valEl = document.getElementById(`dice-val-${pIndex}`);
  
  btn.classList.add('rolling');

  setTimeout(() => {
    btn.classList.remove('rolling');
    
    // ১ থেকে ৬ এর সঠিক র্যান্ডম মান
    const diceVal = Math.floor(Math.random() * 6) + 1;
    valEl.innerText = diceVal;

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

  }, 500);
}

function updateTurnUI() {
  for (let i = 0; i < 4; i++) {
    const slot = document.querySelector(`.slot-${i}`);
    if (slot) {
      if (i === currentPlayer) slot.classList.add('active');
      else slot.classList.remove('active');
    }
  }
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
window.onresize = () => { updatePositions(); drawObjects(); };
