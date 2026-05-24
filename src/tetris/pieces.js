export const PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const PIECE_TYPES = Object.freeze(Object.keys(PIECES));

export const JLSTZ_KICKS = {
  "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

export const I_KICKS = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export function cloneMatrix(matrix) {
  return matrix.map((row) => row.slice());
}

export function rotateMatrix(matrix, dir) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (dir > 0) result[x][n - 1 - y] = matrix[y][x];
      else result[n - 1 - x][y] = matrix[y][x];
    }
  }
  return result;
}

export function get180Kicks(type) {
  if (type === "I") {
    return [
      [0, 0],
      [1, 0],
      [-1, 0],
      [2, 0],
      [-2, 0],
      [0, -1],
      [0, 1],
      [1, -1],
      [-1, -1],
      [1, 1],
      [-1, 1],
    ];
  }
  return [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ];
}

export function createSevenBag(rng = Math.random) {
  const bag = PIECE_TYPES.slice();
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function refillQueue(queue, bag, { min = 7, rng = Math.random } = {}) {
  const nextQueue = queue.slice();
  let nextBag = bag.slice();
  while (nextQueue.length < min) {
    if (nextBag.length === 0) nextBag = createSevenBag(rng);
    nextQueue.push(nextBag.pop());
  }
  return { queue: nextQueue, bag: nextBag };
}

export function createPiece(type, { x = 3, y = type === "I" ? -1 : 0, rotation = 0 } = {}) {
  return {
    type,
    shape: cloneMatrix(PIECES[type]),
    x,
    y,
    rotation,
  };
}
