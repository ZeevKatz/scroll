import { CustomElement, Listen, Dispatch, DispatchEmitter, Prop, Watch } from 'custom-elements-ts';

import { animate, Easing, PlayerId } from '../../shared';
import { ButtonComponent, ConfettiComponent } from '../../components';

@CustomElement({
  tag: 'winner-view',
  template: require('./winner.view.html'),
  style: require('./winner.view.scss')
})
export class WinnerView extends HTMLElement {
  private $cupIconContainer: HTMLDivElement;
  private $title: HTMLHeadingElement;
  private $confetti: ConfettiComponent;
  private $quitButton: ButtonComponent;
  private $fightAgainButton: ButtonComponent;
  private $winnerContainer: HTMLDivElement;
  private $strippedBackground: HTMLDivElement;
  private $backgroundContainers: HTMLDivElement[];

  @Prop()
  playerId: PlayerId;

  @Dispatch('fight-again')
  private readonly fightAgain: DispatchEmitter;

  @Dispatch()
  private readonly quit: DispatchEmitter;

  async connectedCallback() {
    this.$cupIconContainer = this.shadowRoot.querySelector('.cup-icon-container');
    this.$title = this.shadowRoot.querySelector('.title');
    this.$confetti = this.shadowRoot.querySelector('.confetti');
    this.$quitButton = this.shadowRoot.querySelector('.quit-button');
    this.$fightAgainButton = this.shadowRoot.querySelector('.fight-again-button');
    this.$winnerContainer = this.shadowRoot.querySelector('.winner-container');
    this.$strippedBackground = this.shadowRoot.querySelector('.stripped-background');
    this.$backgroundContainers = Array.from(this.shadowRoot.querySelectorAll('.background-container'));
    await this.animateView('enter');
  }

  @Watch('playerId')
  private onPlayerIdChange() {
    if (this.playerId) {
      if (this.playerId === 'one') {
        this.shadowRoot.querySelector<HTMLDivElement>('.background-container--one').classList.add('show');
        this.$winnerContainer.classList.add('flip');
      } else {
        this.shadowRoot.querySelector<HTMLDivElement>('.background-container--two').classList.add('show');
      }
    }
  }

  @Listen('click', '.fight-again-button')
  private async onFightAgainButtonClick() {
    await this.animateView('leave');
    this.fightAgain.emit();
  }

  @Listen('click', '.quit-button')
  private async onQuitButtonClick() {
    await this.animateView('leave');
    this.quit.emit();
  }

  private async animateView(state: 'enter' | 'leave'): Promise<void> {
    const isLeaveAnimation = state === 'leave';
    const time = isLeaveAnimation ? 0.35 : 0.4;

    const strippedBackgroundAnimation = animate({
      element: this.$strippedBackground,
      time: 0.6,
      reverse: isLeaveAnimation,
      from: { opacity: '0' },
      to: { opacity: '1' }
    });

    const cupAndTitleAnimation = animate({
      element: [this.$cupIconContainer, this.$title],
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'scale(0)' },
      to: { opacity: '1', transform: 'scale(1)' }
    });

    const quitButtonAnimation = animate({
      element: this.$quitButton,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'translateX(-50%)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    });

    const fightAgainButtonAnimation = animate({
      element: this.$fightAgainButton,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'translateX(50%)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    });

    const confettiAnimation = animate({
      element: this.$confetti,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0' },
      to: { opacity: '1' }
    });

    if (isLeaveAnimation) {
      await animate({
        element: this.$backgroundContainers,
        time: 0.6,
        ease: Easing.easeInOutQuint,
        to: { height: '50%' }
      });
    }

    return Promise.all([strippedBackgroundAnimation, cupAndTitleAnimation, quitButtonAnimation, fightAgainButtonAnimation, confettiAnimation])
      .then(() => null);
  }
}
