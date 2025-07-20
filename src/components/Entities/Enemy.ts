import Phaser from 'phaser';
import { Board, CellPosition } from '../Board';
import { Entity } from './Entity';

export class Enemy extends Entity {
  movePoints: number;
  private arrow: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, board: Board, position: CellPosition, move = 3) {
    super(scene, board, position, 'O');
    this.movePoints = move;
    const { x, y } = board.worldPosition(position);
    this.arrow = scene.add.text(x, y - 10, '→', { fontSize: '16px', color: '#00ffff' }).setOrigin(0.5);
  }

  moveTo(board: Board, pos: CellPosition) {
    super.moveTo(board, pos);
    const { x, y } = board.worldPosition(pos);
    this.arrow.setPosition(x, y - 10);
  }

  async animateMove(board: Board, pos: CellPosition, duration = 150): Promise<void> {
    const prev = this.position;
    const dx = pos.col - prev.col;
    const dy = pos.row - prev.row;
    this.updateDirection(dx, dy);
    await super.animateMove(board, pos, duration);
    this.arrow.setPosition(this.display.x, this.display.y - 10);
  }

  private updateDirection(dx: number, dy: number) {
    const key = `${Math.sign(dx)},${Math.sign(dy)}`;
    const map: { [k: string]: string } = {
      '1,0': '→',
      '-1,0': '←',
      '0,1': '↓',
      '0,-1': '↑',
      '1,1': '↘',
      '1,-1': '↗',
      '-1,1': '↙',
      '-1,-1': '↖',
      '0,0': '•',
    };
    this.arrow.setText(map[key] || '•');
  }

  kill() {
    super.kill();
    this.arrow.destroy();
  }
}
