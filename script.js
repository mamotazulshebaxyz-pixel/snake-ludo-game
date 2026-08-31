let position = 1;
const snakesAndLadders = { 14: 7, 31: 9, 38: 20, 3: 22, 8: 26, 28: 84 };

function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 100; i >= 1; i--) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = `cell-${i}`;
    cell.innerText = i;
    if (i === position) cell.classList.add('player');
    board.appendChild(cell);
  }
}

function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice-val').innerText = dice;
  if (position + dice <= 100) position += dice;
  if (snakesAndLadders[position]) position = snakesAndLadders[position];
  createBoard();
  document.getElementById('player-pos').innerText = position;
  if (position === 100) alert('অভিনন্দন! আপনি জিতে গেছেন!');
}

createBoard();