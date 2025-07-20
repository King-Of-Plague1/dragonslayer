import Phaser from 'phaser';
import { Board, CellPosition } from '../Board';

export class Entity {
  protected scene: Phaser.Scene;
  position: CellPosition;
  protected display: Phaser.GameObjects.Text;
  alive = true;

  constructor(scene: Phaser.Scene, board: Board, position: CellPosition, char: string) {
    this.scene = scene;
    this.position = position;
    const { x, y } = board.worldPosition(position);
    this.display = scene.add.text(x, y, char, { fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);
  }

  moveTo(board: Board, pos: CellPosition) {
    this.position = pos;
    const { x, y } = board.worldPosition(pos);
    this.display.setPosition(x, y);
  }

  animateMove(board: Board, pos: CellPosition, duration = 150): Promise<void> {
    return new Promise((resolve) => {
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

  kill() {
    this.alive = false;
    this.display.destroy();
  }
}
