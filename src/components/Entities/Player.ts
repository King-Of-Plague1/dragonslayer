import { Board, CellPosition } from '../Board';
import { Entity } from './Entity';

export class Player extends Entity {
  movePoints: number;

  constructor(scene: Phaser.Scene, board: Board, position: CellPosition, move = 5) {
    super(scene, board, position, 'X');
    this.movePoints = move;
  }

  async moveAlong(board: Board, path: CellPosition[]): Promise<void> {
    for (let i = 1; i < path.length; i++) {
      const pos = path[i];
      await this.animateMove(board, pos);
    }
  }
}
