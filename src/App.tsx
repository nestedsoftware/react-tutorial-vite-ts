import { create } from 'zustand';
import type { StateCreator } from 'zustand';

type square = [string, number] | null;

interface GameStore {
  squares: square[];
  currentMove: number;
  lastMoveInHistory: number;
  status: () => string;
  handleClick(i: number): void;
  currentValue(i: number): string | null;
  jumpTo(i: number): void;
}

const createGameLogic: StateCreator<GameStore> = (set, get) => {
  const status = () => {
    const squares = get().squares;
    const currentMove = get().currentMove;
  
    const winner = calculateWinner(squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (isXTurn(currentMove) ? 'X' : 'O');
    }    

    return status;
  }

  const isXTurn = (currentMove: number) => currentMove % 2 === 0;

  const calculateWinner = (squares: square[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[b] && squares[c] && squares[a][0] === squares[b][0] && squares[a][0] === squares[c][0]) {
        return squares[a][0];
      }
    }
    return null;
  };

  const getCopyOfSquares = () => {
    let squares = get().squares;
    const lastMoveInHistory = get().lastMoveInHistory;
    const currentMove = get().currentMove;
    if (lastMoveInHistory > currentMove) {
      set({lastMoveInHistory: currentMove});
      return squares.map(square => {
        if (square !=null) {
          const squareMoveIndex = square[1];
          if (squareMoveIndex >= currentMove) {
            return null;
          }
          return square;
        }
        return null;
      });
    }

    return [...squares];
  };

  const handleClick = (i : number) => {
    const squaresCopy = getCopyOfSquares();
    const currentMove = get().currentMove;

    if (calculateWinner(squaresCopy) || squaresCopy[i]) {
      return;
    }
    if (isXTurn(currentMove)) {
      squaresCopy[i] = ['X', currentMove];
    } else {
      squaresCopy[i] = ['O', currentMove];
    }

    set({ squares: squaresCopy, currentMove: currentMove+1, lastMoveInHistory: currentMove+1 })
  };

  const currentValue = (i: number) => {
    const currentMove: number = get().currentMove;
    const currentSquare = get().squares[i];
    if (currentSquare == null || currentSquare[1] >= currentMove) {
      return null;
    }
    return currentSquare[0];
  }

  const jumpTo = (nextMove: number) => {
    set({currentMove: nextMove})
  }

  return {
    squares: Array(9).fill(null),
    currentMove: 0,
    lastMoveInHistory: 0,
    status: () => status(),
    handleClick: (i: number) => handleClick(i),
    currentValue: (i: number) => currentValue(i),
    jumpTo: (i: number) => jumpTo(i)  
  }

};

const useStore = create<GameStore>((...args) => ({
  ...createGameLogic(...args)
})); 

function Square({index}: {index: number}) {
  const { currentValue, handleClick } = useStore();
  return (
    <button className="square" onClick={() => handleClick(index)}>
      {currentValue(index)}
    </button>
  );
}

function Board() {
  const { status } = useStore();

  return (
    <>
      <div className="status">{status()}</div>
      <div className="board-row">
        <Square index={0} />
        <Square index={1} />
        <Square index={2} />
      </div>
      <div className="board-row">
        <Square index={3} />
        <Square index={4} />
        <Square index={5}/>
      </div>
      <div className="board-row">
        <Square index={6} />
        <Square index={7} />
        <Square index={8} />
      </div>
    </>
  );
}

export default function Game() {
  const { lastMoveInHistory, jumpTo } = useStore();

  
  const moves = [...Array(lastMoveInHistory+1).keys()].map(move => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board/>
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

