const snakes = { 98: 40, 84: 58, 72: 4, 62: 19, 36: 6, 27: 5 };
const ladders = { 8: 26, 12: 50, 29: 74, 42: 81, 67: 88 };

let numPlayers = 4;
let positions = [0, 0, 0, 0];
let winners = []; // বিজয়ীদের র‍্যাঙ্ক ট্র্যাক করা
let currentPlayer = 0;
let isRolling = false;
let waitingForMove = false;
let currentDiceVal = 1;

// ৩ডি ছক্কার রোটেশন ডিগ্রি মান
const diceRotations = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: 90 },
  5: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 }
};

function initBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  for (let row = 9; row >= 0; row--) {
    let isEven = (9 - row) % 2 === 0;
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

function getCoords(num, playerIndex) {
  // ০ থাকলে ৪টি কোণার ডেমো হোম ইয়ার্ডে গুটি বসবে
  if (num === 0) {
    const corner = document.querySelectorAll('.home-yard')[playerIndex];
    const rect = corner.getBoundingClientRect();
    const parent = document.getElementById('board').getBoundingClientRect();
    return { x: rect.left - parent.left + 20 + (playerIndex % 2) * 10, y: rect.top - parent.top + 20 };
  }
  const cell = document.getElementById(`cell-${num}`);
  if (!cell) return { x: 0, y: 0 };
  const rect = cell.getBoundingClientRect();
  const parent = document.getElementById('board').getBoundingClientRect();
  return { x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top + rect.height / 2 };
}

function drawObjects() {
  const svg = document.getElementById('svg-layer');
  svg.innerHTML = '';

  Object.entries(ladders).forEach(([from, to]) => {
    const p1 = getCoords(from, 0), p2 = getCoords(to, 0);
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

  Object.entries(snakes).forEach(([from, to]) => {
    const head = getCoords(from, 0), tail = getCoords(to, 0);
    const midX = (head.x + tail.x) / 2 + (head.x > tail.x ? 30 : -30);
    const midY = (head.y + tail.y) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${head.x} ${head.y} Q ${midX} ${midY} ${tail.x} ${tail.y}`);
    path.setAttribute('stroke', '#2e7d32'); path.setAttribute('stroke-width', '10');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

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
    const coords = getCoords(positions[i], i);
    const p = document.getElementById(`player-${i}`);
    if (p) {
      p.style.left = `${coords.x - 9 + (i * 3)}px`;
      p.style.top = `${coords.y - 9 + (i * 2)}px`;
    }
  }
}

function rollDice(pIndex) {
  if (pIndex !== currentPlayer || isRolling || waitingForMove || winners.includes(pIndex)) return;
  isRolling = true;

  const dice = document.getElementById(`dice-${pIndex}`);
  currentDiceVal = Math.floor(Math.random() * 6) + 1;

  // ৩ডি ঘোড়ার ট্রানজিশন
  const rot = diceRotations[currentDiceVal];
  const xRot = rot.x + (Math.floor(Math.random() * 4) + 3) * 360;
  const yRot = rot.y + (Math.floor(Math.random() * 4) + 3) * 360;

  dice.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg)`;

  setTimeout(() => {
    isRolling = false;

    if (positions[currentPlayer] === 0) {
      if (currentDiceVal === 1) prepareMove();
      else nextTurn();
    } else {
      if (positions[currentPlayer] + currentDiceVal <= 100) prepareMove();
      else nextTurn();
    }
  }, 800);
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

  setTimeout(() => { movePlayerStepByStep(stepsLeft - 1); }, 250);
}

function checkSnakeOrLadder() {
  setTimeout(() => {
    let currPos = positions[currentPlayer];
    if (snakes[currPos]) positions[currentPlayer] = snakes[currPos];
    if (ladders[currPos]) positions[currentPlayer] = ladders[currPos];

    updatePositions();

    // প্লেয়ার ১০০-তে পৌঁছালে র‍্যাঙ্ক আপডেট
    if (positions[currentPlayer] === 100 && !winners.includes(currentPlayer)) {
      winners.push(currentPlayer);
      const rankText = winners.length === 1 ? '1st' : winners.length === 2 ? '2nd' : '3rd';
      document.getElementById(`rank-${currentPlayer}`).innerText = rankText;
      alert(`প্লেয়ার ${currentPlayer + 1} ${rankText} হয়েছেন!`);
      
      // ১ জন বাকি থাকলে গেম শেষ
      if (winners.length === numPlayers - 1) {
        alert('খেলা সমাপ্ত!');
        resetGame();
        return;
      }
    }

    nextTurn();
  }, 300);
}

function nextTurn() {
  do {
    currentPlayer = (currentPlayer + 1) % numPlayers;
  } while (winners.includes(currentPlayer) && winners.length < numPlayers);

  updateTurnUI();
}

function updateTurnUI() {
  for (let i = 0; i < 4; i++) {
    const slot = document.querySelector(`.slot-${i}`);
    if (slot) {
      if (i === currentPlayer && !winners.includes(i)) slot.classList.add('active');
      else slot.classList.remove('active');
    }
  }
  document.getElementById('turn-text').innerText = `প্লেয়ার ${currentPlayer + 1}-এর দান (ছক্কা মারুন)`;
}

function resetGame() {
  numPlayers = parseInt(document.getElementById('player-count').value);
  positions = [0, 0, 0, 0];
  winners = [];
  currentPlayer = 0;
  isRolling = false;
  waitingForMove = false;

  for(let i=0; i<4; i++) {
    const rankEl = document.getElementById(`rank-${i}`);
    if(rankEl) rankEl.innerText = '';
  }

  document.getElementById('corner-p2').style.visibility = numPlayers >= 3 ? 'visible' : 'hidden';
  document.getElementById('corner-p3').style.visibility = numPlayers === 4 ? 'visible' : 'hidden';

  createPlayers();
}

initBoard();
window.onresize = () => { updatePositions(); drawObjects(); };
