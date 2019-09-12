import { CustomElement, Listen } from 'custom-elements-ts';

import { HomeView, GameView, WinnerView } from './views';
import { Player, PlayerId } from './shared';

type View = HomeView | GameView | WinnerView;

@CustomElement({
  tag: 'app-root',
  style: require('./app.component.scss'),
  shadow: false
})
export class AppComponent extends HTMLElement {
  private doubleTouchStartTimestamp = 0;
  private currentView: View;

  private readonly players: Record<PlayerId, Player> = {
    one: new Player(),
    two: new Player()
  };

  connectedCallback() {
    this.showHomeView();
  }

  private showHomeView() {
    const homeView = document.createElement('home-view');
    homeView.addEventListener('fight', () => this.onFight());
    this.appendView(homeView);
  }

  private showGameView() {
    const gameView = document.createElement('game-view');
    gameView.wins = {
      one: this.players.one.getWins(),
      two: this.players.two.getWins()
    };
    gameView.addEventListener('win', (event: CustomEvent<PlayerId>) => this.onWin(event.detail));
    this.appendView(gameView);
  }

  private showWinnerView(playerId: PlayerId) {
    const winnerView = document.createElement('winner-view');
    winnerView.playerId = playerId;
    winnerView.addEventListener('fight-again', () => this.onFightAgain());
    winnerView.addEventListener('quit', () => this.onQuit());
    this.appendView(winnerView);
  }

  private appendView(view: View) {
    if (this.currentView) {
      this.removeChild(this.currentView);
    }
    this.appendChild(view);
    this.currentView = view;
  }

  private onFight() {
    this.showGameView();
  }

  private onWin(playerId: PlayerId) {
    const player = this.players[playerId];
    if (player) {
      player.addWin();
    }
    this.showWinnerView(playerId);
  }

  private onFightAgain() {
    this.showGameView();
  }

  private onQuit() {
    this.players.one.resetWins();
    this.players.two.resetWins();
    this.showHomeView();
  }
  
  @Listen('touchmove')
  private onTouchMove(event: Event) {
    event.preventDefault();
  }
  
  @Listen('touchstart')
  @Listen('mousedown')
  private onTouchStart(event: Event) {
    if (this.doubleTouchStartTimestamp + 500 > Date.now()) {
        event.preventDefault();
    }
    this.doubleTouchStartTimestamp = Date.now();
  }
}
