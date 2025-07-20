import Phaser from 'phaser';
import { BOARD_ROWS, BOARD_COLS, CELL_SIZE } from '../config';
import { Board, CellPosition } from '../components/Board';
import { Player } from '../components/Entities';
import { TurnManager } from '../components/Turn';
import { StepCounter } from '../components/UI';

export class GameScene extends Phaser.Scene {
  private board!: Board;
  private player!: Player;
  private turnManager = new TurnManager();
  private counter!: StepCounter;
  private currentPath: CellPosition[] = [];

  constructor() {
    super('GameScene');
  }

  create() {
    this.board = new Board(this, BOARD_ROWS, BOARD_COLS, CELL_SIZE);
    const startPos: CellPosition = { row: BOARD_ROWS - 1, col: Math.floor(BOARD_COLS / 2) };
    this.player = new Player(this, this.board, startPos, 5);
    this.counter = new StepCounter(this);

    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const cellPos = { row: r, col: c };
        const cell = this.board.getCell(cellPos);
        cell.on('pointerover', () => this.onCellOver(cellPos));
        cell.on('pointerout', () => this.onCellOut());
        cell.on('pointerdown', () => this.onCellDown(cellPos));
      }
    }
  }

  private onCellOver(pos: CellPosition) {
    const path = this.board.computePath(this.player.position, pos);
    this.currentPath = path;
    const reachable = path.length - 1 <= this.player.movePoints;
    const color = reachable ? 0x00ff00 : 0x888888;
    this.board.highlightPath(path, color);
  }

  private onCellOut() {
    this.board.clearHighlight();
    this.currentPath = [];
  }

  private async onCellDown(pos: CellPosition) {
    const path = this.board.computePath(this.player.position, pos);
    if (path.length - 1 > this.player.movePoints) return;
    this.board.highlightPath(path, 0x00ff00);
    this.input.enabled = false;
    await this.player.moveAlong(this.board, path);
    this.turnManager.nextTurn();
    this.counter.update(this.turnManager.turn);
    this.input.enabled = true;
    this.board.clearHighlight();
  }
}
