import Phaser from 'phaser';
import { BOARD_ROWS, BOARD_COLS, CELL_SIZE } from '../config';
import { Board, CellPosition } from '../components/Board';
import { Player, Enemy } from '../components/Entities';
import { TurnManager } from '../components/Turn';
import { StepCounter } from '../components/UI';

export class GameScene extends Phaser.Scene {
  private board!: Board;
  private player!: Player;
  private enemies: Enemy[] = [];
  private turnManager = new TurnManager();
  private counter!: StepCounter;
  private currentPath: CellPosition[] = [];
  private flags: { pos: CellPosition; mark: Phaser.GameObjects.Text }[] = [];
  private playerAlive = true;

  constructor() {
    super('GameScene');
  }

  create() {
    this.board = new Board(this, BOARD_ROWS, BOARD_COLS, CELL_SIZE);
    this.input.mouse?.disableContextMenu();
    const startPos: CellPosition = { row: BOARD_ROWS - 1, col: Math.floor(BOARD_COLS / 2) };
    this.player = new Player(this, this.board, startPos, 5);
    this.counter = new StepCounter(this);

    // spawn enemies on random cells not equal to player start
    const used = new Set([`${startPos.row},${startPos.col}`]);
    for (let i = 0; i < 3; i++) {
      let pos: CellPosition;
      do {
        pos = { row: Phaser.Math.Between(0, BOARD_ROWS - 1), col: Phaser.Math.Between(0, BOARD_COLS - 1) };
      } while (used.has(`${pos.row},${pos.col}`));
      used.add(`${pos.row},${pos.col}`);
      this.enemies.push(new Enemy(this, this.board, pos, 3));
    }

    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const cellPos = { row: r, col: c };
        const cell = this.board.getCell(cellPos);
        cell.on('pointerover', () => this.onCellOver(cellPos));
        cell.on('pointerout', () => this.onCellOut());
        cell.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onCellDown(cellPos, pointer));
      }
    }
  }

  private onCellOver(pos: CellPosition) {
    const path = this.computeFullPath(pos);
    this.currentPath = path;
    const reachable = path.length - 1 <= this.player.movePoints;
    const color = reachable ? 0x00ff00 : 0x888888;
    this.board.highlightPath(path, color);
  }

  private onCellOut() {
    this.board.clearHighlight();
    this.currentPath = [];
  }

  private async onCellDown(pos: CellPosition, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      this.handleRightClick(pos);
      return;
    }
    const path = this.computeFullPath(pos);
    if (path.length - 1 > this.player.movePoints) return;
    this.board.highlightPath(path, 0x00ff00);
    this.input.enabled = false;
    await this.movePhase(path);
    this.turnManager.nextTurn();
    this.counter.update(this.turnManager.turn);
    this.input.enabled = true;
    this.board.clearHighlight();
  }

  private computeFullPath(target: CellPosition): CellPosition[] {
    const points = [target];
    for (let i = this.flags.length - 1; i >= 0; i--) {
      points.unshift(this.flags[i].pos);
    }
    let start = this.player.position;
    const full: CellPosition[] = [start];
    for (const p of points) {
      const part = this.board.computePath(start, p);
      full.push(...part.slice(1));
      start = p;
    }
    return full;
  }

  private handleRightClick(pos: CellPosition) {
    const last = this.flags[this.flags.length - 1];
    if (last && last.pos.row === pos.row && last.pos.col === pos.col) {
      last.mark.destroy();
      this.flags.pop();
      this.board.clearHighlight();
      return;
    }
    if (this.flags.length >= this.player.movePoints) return;
    const already = this.flags.find((f) => f.pos.row === pos.row && f.pos.col === pos.col);
    if (already) return;
    const { x, y } = this.board.worldPosition(pos);
    const mark = this.add.text(x, y, '.', { fontSize: '32px', color: '#ffff00' }).setOrigin(0.5);
    this.flags.push({ pos, mark });
  }

  private async movePhase(playerPath: CellPosition[]) {
    const enemyPaths = this.enemies.map((e) => this.randomEnemyPath(e));
    const max = Math.max(playerPath.length, ...enemyPaths.map((p) => p.length));
    let prevPlayerPos = this.player.position;
    let prevEnemyPos = this.enemies.map((e) => e.position);

    for (let i = 1; i < max; i++) {
      const nextPlayer = playerPath[i] ?? prevPlayerPos;
      const nextEnemies = enemyPaths.map((p, idx) => p[i] ?? prevEnemyPos[idx]);

      this.checkCollisions(prevPlayerPos, nextPlayer, prevEnemyPos, nextEnemies);

      const moves: Promise<void>[] = [];
      if (this.playerAlive && (nextPlayer.row !== prevPlayerPos.row || nextPlayer.col !== prevPlayerPos.col)) {
        moves.push(this.player.animateMove(this.board, nextPlayer));
      }
      this.enemies.forEach((e, idx) => {
        if (!e.alive) return;
        const np = nextEnemies[idx];
        if (np.row !== prevEnemyPos[idx].row || np.col !== prevEnemyPos[idx].col) {
          moves.push(e.animateMove(this.board, np));
        }
      });
      await Promise.all(moves);

      prevPlayerPos = this.player.position;
      prevEnemyPos = this.enemies.map((e) => e.position);

      if (this.flags.length && this.flags[0].pos.row === this.player.position.row && this.flags[0].pos.col === this.player.position.col) {
        this.flags[0].mark.destroy();
        this.flags.shift();
      }

      if (!this.playerAlive || this.enemies.every((e) => !e.alive)) {
        this.time.delayedCall(200, () => this.scene.restart());
        return;
      }
    }
  }

  private randomEnemyPath(enemy: Enemy): CellPosition[] {
    for (let i = 0; i < 20; i++) {
      const pos = { row: Phaser.Math.Between(0, BOARD_ROWS - 1), col: Phaser.Math.Between(0, BOARD_COLS - 1) };
      const p = this.board.computePath(enemy.position, pos);
      if (p.length - 1 <= enemy.movePoints) return p;
    }
    return [enemy.position];
  }

  private checkCollisions(prevPlayer: CellPosition, nextPlayer: CellPosition, prevEnemies: CellPosition[], nextEnemies: CellPosition[]) {
    this.enemies.forEach((e, idx) => {
      if (!e.alive) return;
      const prevE = prevEnemies[idx];
      const nextE = nextEnemies[idx];

      // enemy vs player
      if (this.same(nextPlayer, nextE) || (this.same(prevPlayer, nextE) && this.same(prevE, nextPlayer))) {
        e.kill();
        this.player.kill();
        this.playerAlive = false;
      } else if (this.same(nextPlayer, prevE) && this.same(nextE, prevE)) {
        this.player.kill();
        this.playerAlive = false;
      }
    });

    // enemy vs enemy
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];
        if (!e1.alive || !e2.alive) continue;
        const n1 = nextEnemies[i];
        const n2 = nextEnemies[j];
        const p1 = prevEnemies[i];
        const p2 = prevEnemies[j];
        if (this.same(n1, n2) || (this.same(p1, n2) && this.same(p2, n1))) {
          e1.kill();
          e2.kill();
        }
      }
    }
  }

  private same(a: CellPosition, b: CellPosition): boolean {
    return a.row === b.row && a.col === b.col;
  }
}
