const snakes = [{ start: 22, end: 1 }, { start: 24, end: 13 }, { start: 7, end: 4 }];
const ladders = [{ start: 2, end: 9 }, { start: 8, end: 18 }, { start: 11, end: 23 }];

let position = 1;
const board = document.getElementById('board');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function initBoard() {
  board.innerHTML = '';
  for (let row = 4; row >= 0; row--) {
    let isEven = (4 - row) % 2 === 1;
    for (let col = 0; col < 5; col++) {
      let cellNum = row * 5 + (isEven ? (5 - col) : (col + 1));
      const cell = document.createElement('div');
      cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'blue'}`;
      cell.innerText = cellNum;
      cell.id = `cell-${cellNum}`;
      board.appendChild(cell);
    }
  }
  const player = document.createElement('div');
  player.className = 'player';
  player.id = 'player';
  document.querySelector('.game-container').appendChild(player);
  setTimeout(() => { drawObjects(); updatePlayerPos(); }, 100);
}

function getCellCoords(num) {
  const cell = document.getElementById(`cell-${num}`);
  const rect = cell.getBoundingClientRect();
  const pRect = board.getBoundingClientRect();
  return { x: rect.left - pRect.left + rect.width / 2, y: rect.top - pRect.top + rect.height / 2 };
}

function drawObjects() {
  ctx.clearRect(0, 0, 400, 400);
  
  // সিঁড়ি আঁকা
  ladders.forEach(l => {
    const p1 = getCellCoords(l.start), p2 = getCellCoords(l.end);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = '#00e676'; ctx.lineWidth = 12; ctx.stroke();
  });

  // সাপ আঁকা
  snakes.forEach(s => {
    const p1 = getCellCoords(s.start), p2 = getCellCoords(s.end);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo((p1.x + p2.x)/2 + 30, (p1.y + p2.y)/2, p2.x, p2.y);
    ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
  });
}

function updatePlayerPos() {
  const coords = getCellCoords(position);
  const player = document.getElementById('player');
  player.style.left = `${coords.x - 12}px`;
  player.style.top = `${coords.y - 12}px`;
}

function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice-val').innerText = dice;
  if (position + dice <= 25) position += dice;
  
  updatePlayerPos();
  
  setTimeout(() => {
    const snake = snakes.find(s => s.start === position);
    const ladder = ladders.find(l => l.start === position);
    if (snake) position = snake.end;
    if (ladder) position = ladder.end;
    updatePlayerPos();
    document.getElementById('player-pos').innerText = position;
    if (position === 25) alert('আপনি জিতে গেছেন!');
  }, 500);
}

initBoard();
