import Phaser from 'phaser';
import { CellPosition } from './types';

export class Board {
  private scene: Phaser.Scene;
  readonly rows: number;
  readonly cols: number;
  readonly cellSize: number;
  private cells: Phaser.GameObjects.Rectangle[][] = [];

  constructor(scene: Phaser.Scene, rows: number, cols: number, cellSize: number) {
    this.scene = scene;
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.create();
  }

  private create() {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.3);
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.cellSize;
        const y = r * this.cellSize + 50; // offset for UI
        const rect = this.scene.add
          .rectangle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize, this.cellSize)
          .setStrokeStyle(1, 0xffffff, 0.2)
          .setOrigin(0.5)
          .setInteractive();
        this.cells[r][c] = rect as Phaser.GameObjects.Rectangle;
      }
    }
    for (let r = 0; r <= this.rows; r++) {
      graphics.moveTo(0, 50 + r * this.cellSize);
      graphics.lineTo(this.cols * this.cellSize, 50 + r * this.cellSize);
    }
    for (let c = 0; c <= this.cols; c++) {
      graphics.moveTo(c * this.cellSize, 50);
      graphics.lineTo(c * this.cellSize, 50 + this.rows * this.cellSize);
    }
    graphics.strokePath();
  }

  getCell(pos: CellPosition): Phaser.GameObjects.Rectangle {
    return this.cells[pos.row][pos.col];
  }

  worldPosition(pos: CellPosition): { x: number; y: number } {
    return {
      x: pos.col * this.cellSize + this.cellSize / 2,
      y: 50 + pos.row * this.cellSize + this.cellSize / 2,
    };
  }

  computePath(start: CellPosition, end: CellPosition): CellPosition[] {
    const queue: CellPosition[] = [start];
    const visited = new Set<string>();
    const parent = new Map<string, CellPosition | null>();
    const key = (p: CellPosition) => `${p.row},${p.col}`;
    visited.add(key(start));
    parent.set(key(start), null);
    const dirs = [
      { r: 1, c: 0 },
      { r: -1, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: -1 },
      { r: 1, c: 1 },
      { r: 1, c: -1 },
      { r: -1, c: 1 },
      { r: -1, c: -1 },
    ];
    while (queue.length) {
      const cur = queue.shift()!;
      if (cur.row === end.row && cur.col === end.col) break;
      for (const d of dirs) {
        const nr = cur.row + d.r;
        const nc = cur.col + d.c;
        if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
        const n: CellPosition = { row: nr, col: nc };
        const k = key(n);
        if (!visited.has(k)) {
          visited.add(k);
          parent.set(k, cur);
          queue.push(n);
        }
      }
    }
    const path: CellPosition[] = [];
    let current: CellPosition | undefined = end;
    while (current) {
      path.unshift(current);
      const p = parent.get(key(current));
      if (!p) break;
      current = p;
    }
    return path;
  }

  clearHighlight() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].setFillStyle();
      }
    }
  }

  highlightPath(path: CellPosition[], color: number) {
    this.clearHighlight();
    path.forEach((p) => {
      this.getCell(p).setFillStyle(color, 0.5);
    });
  }
}
