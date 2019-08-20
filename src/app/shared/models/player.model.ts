export type PlayerId = 'one' | 'two';

export class Player {
  private _wins = 0;

  getWins(): number {
    return this._wins;
  }

  addWin() {
    this._wins++;
  }

  resetWins() {
    this._wins = 0;
  }
}