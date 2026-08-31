// লাল লাইন অনুযায়ী নতুন সাপ (৭২ থেকে ৪) যোগ করা হয়েছে
const snakes = { 98: 40, 84: 58, 72: 4, 62: 19, 36: 6, 27: 5 };
const ladders = { 8: 26, 12: 50, 29: 74, 42: 81, 67: 88 };

let numPlayers = 4;
let positions = [0, 0, 0, 0]; // 0 মানে গেমের বাইরে
let currentPlayer = 0;
let isRolling = false;
let waitingForMove = false;
let currentDiceVal = 0;

function initBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  // নিচ থেকে শুরু (১ বাঁ দিক থেকে ডান দিকে)
  for (let row = 9; row >= 0; row--) {
    let isEven = (9 - row) % 2 === 0; // বাঁ দিক থেকে ডান দিকে ১, ২, ৩ শুরু করার লজিক
    for (let col = 0; col < 10; col++) {
      let cellNum = row * 10 + (isEven ? (col + 1) : (10 - col));
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
    p.onclick = () => onPlayerClick(i);
    layer.appendChild(p);
  }
  updatePositions();
  updateTurnUI();
}

function getCoords(num) {
  // 0 থাকলে বোর্ডের বাইরে নিচে-বামে ১ নম্বর ঘরের ঠিক বাইরে থাকবে
  if (num === 0) return { x: -25, y: 465 }; 
  const cell = document.getElementById(`cell-${num}`);
  if (!cell) return { x: 0, y: 0 };
  const rect = cell.getBoundingClientRect();
  const parent = document.getElementById('board').getBoundingClientRect();
  return { x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top + rect.height / 2 };
}

function drawObjects() {
  const svg = document.getElementById('svg-layer');
  svg.innerHTML = '';

  // মই আঁকা
  Object.entries(ladders).forEach(([from, to]) => {
    const p1 = getCoords(from), p2 = getCoords(to);
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy), angle = Math.atan2(dy, dx);
    const perpX = Math.sin(angle) * 8, perpY = -Math.cos(angle) * 8;

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', p1.x + perpX); line1.setAttribute('y1', p1.y + perpY);
    line1.setAttribute('x2', p2.x + perpX); line1.setAttribute('y2', p2.y + perpY);
    line1.setAttribute('stroke', '#8d6e63'); line1.setAttribute('stroke-width', '4');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', p1.x - perpX); line2.setAttribute('y1', p1.y - perpY);
    line2.setAttribute('x2', p2.x - perpX); line2.setAttribute('y2', p2.y - perpY);
    line2.setAttribute('stroke', '#8d6e63'); line2.setAttribute('stroke-width', '4');

    svg.appendChild(line1); svg.appendChild(line2);

    const steps = Math.floor(len / 18);
    for (let i = 1; i < steps; i++) {
      const stepX = p1.x + (dx * (i / steps)), stepY = p1.y + (dy * (i / steps));
      const stepLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stepLine.setAttribute('x1', stepX + perpX); stepLine.setAttribute('y1', stepY + perpY);
      stepLine.setAttribute('x2', stepX - perpX); stepLine.setAttribute('y2', stepY - perpY);
      stepLine.setAttribute('stroke', '#d7ccc8'); stepLine.setAttribute('stroke-width', '3');
      svg.appendChild(stepLine);
    }
  });

  // সাপ আঁকা
  Object.entries(snakes).forEach(([from, to]) => {
    const head = getCoords(from), tail = getCoords(to);
    const midX = (head.x + tail.x) / 2 + (head.x > tail.x ? 30 : -30);
    const midY = (head.y + tail.y) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${head.x} ${head.y} Q ${midX} ${midY} ${tail.x} ${tail.y}`);
    path.setAttribute('stroke', '#2e7d32'); path.setAttribute('stroke-width', '10');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // সাপের মাথা ও চোখ
    const headCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    headCircle.setAttribute('cx', head.x); headCircle.setAttribute('cy', head.y);
    headCircle.setAttribute('r', '7'); headCircle.setAttribute('fill', '#1b5e20');
    svg.appendChild(headCircle);

    const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye.setAttribute('cx', head.x - 2); eye.setAttribute('cy', head.y - 2);
    eye.setAttribute('r', '2'); eye.setAttribute('fill', '#ffffff');
    svg.appendChild(eye);

    const tongue = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tongue.setAttribute('x1', head.x); tongue.setAttribute('y1', head.y);
    tongue.setAttribute('x2', head.x - 5); tongue.setAttribute('y2', head.y - 5);
    tongue.setAttribute('stroke', '#d50000'); tongue.setAttribute('stroke-width', '2');
    svg.appendChild(tongue);
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
  if (pIndex !== currentPlayer || isRolling || waitingForMove) return;
  isRolling = true;

  const btn = document.getElementById(`btn-p${pIndex}`);
  const valEl = document.getElementById(`dice-val-${pIndex}`);
  
  btn.classList.add('rolling');

  setTimeout(() => {
    btn.classList.remove('rolling');
    currentDiceVal = Math.floor(Math.random() * 6) + 1;
    valEl.innerText = currentDiceVal;
    isRolling = false;

    if (positions[currentPlayer] === 0) {
      if (currentDiceVal === 1) {
        prepareMove();
      } else {
        nextTurn();
      }
    } else {
      if (positions[currentPlayer] + currentDiceVal <= 100) {
        prepareMove();
      } else {
        nextTurn();
      }
    }
  }, 500);
}

function prepareMove() {
  waitingForMove = true;
  const activePlayer = document.getElementById(`player-${currentPlayer}`);
  activePlayer.classList.add('waiting-click');
  document.getElementById('turn-text').innerText = `প্লেয়ার ${currentPlayer + 1}-এর চাল (গুটিতে ক্লিক করুন)`;
}

function onPlayerClick(pIndex) {
  if (!waitingForMove || pIndex !== currentPlayer) return;

  const activePlayer = document.getElementById(`player-${currentPlayer}`);
  activePlayer.classList.remove('waiting-click');
  waitingForMove = false;

  if (positions[currentPlayer] === 0 && currentDiceVal === 1) {
    positions[currentPlayer] = 1;
    updatePositions();
    checkSnakeOrLadder();
  } else {
    movePlayerStepByStep(currentDiceVal);
  }
}

function movePlayerStepByStep(stepsLeft) {
  if (stepsLeft <= 0) {
    checkSnakeOrLadder();
    return;
  }
  positions[currentPlayer]++;
  updatePositions();

  setTimeout(() => {
    movePlayerStepByStep(stepsLeft - 1);
  }, 250);
}

function checkSnakeOrLadder() {
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

    nextTurn();
  }, 300);
}

function nextTurn() {
  currentPlayer = (currentPlayer + 1) % numPlayers;
  updateTurnUI();
}

function updateTurnUI() {
  for (let i = 0; i < 4; i++) {
    const slot = document.querySelector(`.slot-${i}`);
    if (slot) {
      if (i === currentPlayer) slot.classList.add('active');
      else slot.classList.remove('active');
    }
  }
  document.getElementById('turn-text').innerText = `প্লেয়ার ${currentPlayer + 1}-এর দান (ছক্কা মারুন)`;
}

function resetGame() {
  numPlayers = parseInt(document.getElementById('player-count').value);
  positions = [0, 0, 0, 0];
  currentPlayer = 0;
  isRolling = false;
  waitingForMove = false;

  document.getElementById('slot-p2').style.visibility = numPlayers >= 3 ? 'visible' : 'hidden';
  document.getElementById('slot-p3').style.visibility = numPlayers === 4 ? 'visible' : 'hidden';

  createPlayers();
}

initBoard();
window.onresize = () => { updatePositions(); drawObjects(); };
