import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // assets would be loaded here
  }

  create() {
    this.scene.start('GameScene');
  }
}
