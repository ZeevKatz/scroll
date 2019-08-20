import { CustomElement, Listen, DispatchEmitter, Dispatch } from 'custom-elements-ts';

import { animate } from '../../shared';
import { ButtonComponent } from '../../components';

@CustomElement({
  tag: 'home-view',
  template: require('./home.view.html'),
  style: require('./home.view.scss')
})
export class HomeView extends HTMLElement {
  private playButtonClicked: boolean;

  private $scrollIconContainer: HTMLDivElement;
  private $playButton: ButtonComponent;
  private $title: HTMLHeadingElement;
  private $copyrights: HTMLDivElement;

  @Dispatch()
  private readonly fight: DispatchEmitter;

  async connectedCallback() {
    this.$scrollIconContainer = this.shadowRoot.querySelector('.scroll-icon-container');
    this.$title = this.shadowRoot.querySelector('.title');
    this.$playButton = this.shadowRoot.querySelector('.play-button');
    this.$copyrights = this.shadowRoot.querySelector('.copyrights');
    await this.animateView('enter');
  }

  @Listen('click', '.play-button')
  private async onPlayClick() {
    if (!this.playButtonClicked) {
      this.playButtonClicked = true;
      await this.animateView('leave');
      this.fight.emit();
    }
  }

  private async animateView(state: 'enter' | 'leave'): Promise<void> {
    const isLeaveAnimation = state === 'leave';
    const time = isLeaveAnimation ? 0.35 : 0.4;

    const scrollIconAnimation = animate({
      element: this.$scrollIconContainer,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'scale(0)' },
      to: { opacity: '1', transform: 'scale(1)' }
    });

    const titleAnimation = animate({
      element: this.$title,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'scale(0)' },
      to: { opacity: '1', transform: 'scale(1)' }
    });

    const playButtonAnimation = animate({
      element: this.$playButton,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'translateY(50%)' },
      to: { opacity: '1', transform: 'translateY(0)' }
    });
    
    const copyrightsAnimation = animate({
      element: this.$copyrights,
      time,
      reverse: isLeaveAnimation,
      from: { opacity: '0', transform: 'translate(-50%, 50%)' },
      to: { opacity: '1', transform: 'translate(-50%, 0)' }
    });
    
    return Promise.all([scrollIconAnimation, titleAnimation, playButtonAnimation, copyrightsAnimation])
      .then(() => null);
  }
}
