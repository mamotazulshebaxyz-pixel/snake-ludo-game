const snakes = { 31: 9, 38: 20, 84: 28, 98: 40, 62: 18 };
const ladders = { 3: 22, 8: 26, 14: 70, 28: 84, 50: 91 };

let numPlayers = 2;
let positions = [1, 1, 1, 1];
let currentPlayer = 0;

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

      // সাপ ও সিঁড়ির আইকন
      if (snakes[cellNum]) cell.innerHTML += `<span class="asset" style="right:2px; bottom:2px;">🐍</span>`;
      if (ladders[cellNum]) cell.innerHTML += `<span class="asset" style="right:2px; bottom:2px;">🪜</span>`;

      board.appendChild(cell);
    }
  }
  createPlayers();
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
}

function getCoords(num) {
  const cell = document.getElementById(`cell-${num}`);
  const rect = cell.getBoundingClientRect();
  const parent = document.getElementById('board').getBoundingClientRect();
  return { x: rect.left - parent.left + 12, y: rect.top - parent.top + 12 };
}

function updatePositions() {
  for (let i = 0; i < numPlayers; i++) {
    const coords = getCoords(positions[i]);
    const p = document.getElementById(`player-${i}`);
    // প্লেয়াররা যাতে একে অপরের উপর ঢেকে না যায়
    p.style.left = `${coords.x + (i * 4)}px`;
    p.style.top = `${coords.y + (i * 2)}px`;
  }
}

function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice-val').innerText = dice;

  if (positions[currentPlayer] + dice <= 100) {
    positions[currentPlayer] += dice;
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

    // পরবর্তী প্লেয়ারের চাল
    currentPlayer = (currentPlayer + 1) % numPlayers;
    document.getElementById('turn-text').innerText = `প্লেয়ার ${currentPlayer + 1}-এর দান`;
  }, 400);
}

function resetGame() {
  numPlayers = parseInt(document.getElementById('player-count').value);
  positions = [1, 1, 1, 1];
  currentPlayer = 0;
  document.getElementById('turn-text').innerText = `প্লেয়ার ১-এর দান`;
  document.getElementById('dice-val').innerText = '0';
  createPlayers();
}

initBoard();
window.onresize = updatePositions;
