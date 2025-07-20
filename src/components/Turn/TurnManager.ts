export class TurnManager {
  private _turn = 0;

  get turn() {
    return this._turn;
  }

  nextTurn() {
    this._turn += 1;
  }
}
