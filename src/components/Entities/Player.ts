import { Board, CellPosition } from '../Board';
import { Entity } from './Entity';

export class Player extends Entity {
  movePoints: number;

  constructor(scene: Phaser.Scene, board: Board, position: CellPosition, move = 5) {
    super(scene, board, position, 'X');
    this.movePoints = move;
  }

  async moveAlong(board: Board, path: CellPosition[]): Promise<void> {
    const duration = 150;
    for (let i = 1; i < path.length; i++) {
      await new Promise<void>((resolve) => {
        const pos = path[i];
        const { x, y } = board.worldPosition(pos);
        this.scene.tweens.add({
          targets: this.display,
          x,
          y,
          duration,
          onComplete: () => {
            this.position = pos;
            resolve();
          },
        });
      });
    }
  }
}
