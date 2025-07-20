import Phaser from 'phaser';
import { Board, CellPosition } from '../Board';

export class Entity {
  protected scene: Phaser.Scene;
  position: CellPosition;
  protected display: Phaser.GameObjects.Text;

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
}
