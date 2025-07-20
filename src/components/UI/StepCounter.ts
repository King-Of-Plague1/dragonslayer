import Phaser from 'phaser';

export class StepCounter {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(10, 10, '0', {
      fontSize: '32px',
      color: '#ffffff',
    });
  }

  update(turn: number) {
    this.text.setText(String(turn));
  }
}
