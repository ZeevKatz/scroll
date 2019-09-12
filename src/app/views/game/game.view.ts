import { CustomElement, Dispatch, DispatchEmitter, Listen, Prop, Watch } from 'custom-elements-ts';

import { throttle, animate, Easing, PlayerId, TinyGesture } from '../../shared';

@CustomElement({
  tag: 'game-view',
  template: require('./game.view.html'),
  style: require('./game.view.scss')
})
export class GameView extends HTMLElement {
  private static readonly WINNER_SCORE = 100;
  private static readonly START_SCORE = 50;
  private static readonly VELOCITY_TO_SCORE_FACTOR = 0.5;
  private static readonly MAX_SCORE = 15;
  private static readonly THROTTLE_LIMIT = 75;
  
  private static velocityToScore(velocity: number) {
    return Math.min(Math.abs(velocity) * this.VELOCITY_TO_SCORE_FACTOR, this.MAX_SCORE);
  }
  
  private gameStarted: boolean;

  private playerOneScore: number;
  private playerTwoScore: number;

  private $playerOneContainer: HTMLDivElement;
  private $playerTwoContainer: HTMLDivElement;
  private $playerOneScore: HTMLSpanElement;
  private $playerTwoScore: HTMLSpanElement;
  private $playerOneWins: HTMLSpanElement;
  private $playerTwoWins: HTMLSpanElement;

  private readonly playerOneGesture = new TinyGesture(this);
  
  private readonly playerTwoGesture = new TinyGesture(this);

  @Prop()
  wins: Record<PlayerId, number>;

  @Dispatch()
  private readonly win: DispatchEmitter;

  get playerOneIsWinner(): boolean {
    return this.playerOneScore === GameView.WINNER_SCORE;
  }

  get playerTwoIsWinner(): boolean {
    return this.playerTwoScore === GameView.WINNER_SCORE;
  }

  connectedCallback() {
    this.$playerOneContainer = this.shadowRoot.querySelector('.player-container--one');
    this.$playerTwoContainer = this.shadowRoot.querySelector('.player-container--two');
    this.$playerOneScore = this.shadowRoot.querySelector('.player-score--one');
    this.$playerTwoScore = this.shadowRoot.querySelector('.player-score--two');
    this.$playerOneWins = this.shadowRoot.querySelector('.player-wins--one');
    this.$playerTwoWins = this.shadowRoot.querySelector('.player-wins--two');
    
    this.playerOneGesture.on('panmove', throttle(() => {
      if (this.gameStarted && this.playerOneGesture.velocityY > 0) {
        const score = GameView.velocityToScore(this.playerOneGesture.velocityY);
        this.updateScores(score);
      }
    }, GameView.THROTTLE_LIMIT));
    
    this.playerTwoGesture.on('panmove', throttle(() => {
      if (this.gameStarted && this.playerTwoGesture.velocityY < 0) {
        const score = GameView.velocityToScore(this.playerTwoGesture.velocityY);
        this.updateScores(-score);
      }
    }, GameView.THROTTLE_LIMIT));
  }

  disconnectedCallback() {
    if (this.playerOneGesture) {
      this.playerOneGesture.destroy();
    }
    if (this.playerTwoGesture) {
      this.playerTwoGesture.destroy();
    }
  }

  @Watch('wins')
  private onWinsChanges() {
    if (this.wins) {
      this.$playerOneWins.textContent = this.wins.one.toString();
      this.$playerTwoWins.textContent = this.wins.two.toString();
    }
  }

  @Listen('done', '.countdown')
  private async onStartCountdownDone() {
    this.gameStarted = true;
    this.resetGame();
    this.render();
    await this.animateView('enter');
  }

  private async updateScores(score: number) {
    if (this.gameStarted) {
      const normalizedPlayerOneScore = this.normalizeScore(this.playerOneScore + score);
      const normalizedPlayerTwoScore = this.normalizeScore(this.playerTwoScore + (this.playerOneScore - normalizedPlayerOneScore));
      this.playerOneScore = normalizedPlayerOneScore;
      this.playerTwoScore = normalizedPlayerTwoScore;
      this.render();
      this.checkWinner();
    }
  }
  
  private async checkWinner() {
    if (this.playerOneIsWinner || this.playerTwoIsWinner) {
      this.gameStarted = false;
      await this.animateView('leave');
      this.win.emit({detail: this.playerOneIsWinner ? 'one' : 'two'});
    }
  }

  private resetGame() {
    this.playerOneScore = GameView.START_SCORE;
    this.playerTwoScore = GameView.START_SCORE;
  }

  private normalizeScore(score: number) {
    return Math.round(Math.min(Math.max(score, 0), GameView.WINNER_SCORE));
  }

  private async render(): Promise<void> {
    this.$playerOneScore.textContent = this.playerOneScore.toString();
    this.$playerTwoScore.textContent = this.playerTwoScore.toString();
    const playerOneContainerAnimation = this.animatePlayerContainer(this.$playerOneContainer, this.playerOneScore);
    const playerTwoContainerAnimation = this.animatePlayerContainer(this.$playerTwoContainer, this.playerTwoScore);
    return Promise.all([playerOneContainerAnimation, playerTwoContainerAnimation])
      .then(() => null);
  }

  private async animatePlayerContainer($playerContainer: HTMLElement, playerScore: number): Promise<void> {
    return await animate({
      element: $playerContainer,
      time: 0.2,
      ease: Easing.easeInOutCubic,
      to: {
        height: `${playerScore}%`,
        fontSize: `${playerScore * 0.125}rem`
      }
    });
  }

  private async animateView(state: 'enter' | 'leave'): Promise<void> {
    const isLeaveAnimation = state === 'leave';
    const playersScoresAnimation = animate({
      element: [this.$playerOneScore, this.$playerTwoScore],
      time: isLeaveAnimation ? 0.2 : 0.3,
      delay: isLeaveAnimation ? 0.3 : 0,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'scale(0.5)' },
      to: { opacity: '1', transform: 'scale(1)' }
    });

    const playersWinsAnimation = animate({
      element: [this.$playerOneWins, this.$playerTwoWins],
      time: 0.3,
      reverse: isLeaveAnimation,
      ease: Easing.easeInOutCirc,
      from: { opacity: '0', transform: 'translate(100%, 100%)' },
      to: { opacity: '1', transform: 'translate(0, 0)' }
    });

    return Promise.all([playersScoresAnimation, playersWinsAnimation])
      .then(() => null);
  }
}
