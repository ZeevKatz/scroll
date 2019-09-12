import { CustomElement, Prop } from 'custom-elements-ts';

import { animate, Easing } from '../../shared';

@CustomElement({
  tag: 'app-confetti',
  template: ``,
  style: require('./confetti.component.scss')
})
export class ConfettiComponent extends HTMLElement {
  private static readonly selectors = {
    confetti: 'confetti',
    confettiColors: ['confetti--one', 'confetti--two', 'confetti--three']
  };

  private static get randomColor() {
    const confettiColorsLength = this.selectors.confettiColors.length;
    const randomIndex = Math.floor(Math.random() * confettiColorsLength);
    return this.selectors.confettiColors[randomIndex];
  }

  private static readonly sizeRatio = 1.15;

  @Prop()
  private readonly quantity: number;

  @Prop()
  private readonly size: number;

  @Prop()
  private readonly speed: number;

  private get sizeOrDefault(): number {
    return this.size || 0.5;
  }

  private get speedOrDefault(): number {
    return this.speed || 4;
  }

  private get randomWidth(): number {
    return Math.random() * this.sizeOrDefault;
  }

  private get randomHeight(): number {
    return Math.random() * this.sizeOrDefault * ConfettiComponent.sizeRatio;
  }

  private get randomTop(): number {
    return -Math.random() * 20 * this.sizeOrDefault;
  }

  private get randomLeft(): number {
    return Math.random() * 100;
  }

  private get randomOpacity(): number {
    return Math.random() + 0.5;
  }

  private get randomDegrees(): number {
    return Math.random() * 360;
  }

  private get speedInMilliseconds(): number {
    return this.speedOrDefault * 1000;
  }

  private get randomSpeedInMilliseconds(): number {
    return (Math.random() + 1) * this.speedInMilliseconds;
  }

  connectedCallback() {
    setTimeout(() => this.fireConfetti());
  }

  private fireConfetti() {
    this.createConfettiList(parseInt(this.quantity as any))
    .forEach(async confetti => {
      this.shadowRoot.appendChild(confetti);
      await this.animateConfetti(confetti);
      this.shadowRoot.removeChild(confetti);
    });
  }

  private createConfettiList(length: number): HTMLElement[] {
    return new Array(length)
    .fill(null)
    .map(() => this.createConfetti());
  }

  private createConfetti(): HTMLElement {
    const confetti = document.createElement('div');
    confetti.classList.add(ConfettiComponent.selectors.confetti, ConfettiComponent.randomColor);
    return confetti;
  }

  private animateConfetti(confetti: HTMLElement): Promise<void> {
    const time = this.randomSpeedInMilliseconds / 1000;
    return animate({
      element: confetti,
      time,
      ease: Easing.linear,
      from: {
        width: `${this.randomWidth}rem`,
        height: `${this.randomHeight}rem`,
        top: `${this.randomTop}%`,
        left: `${this.randomLeft}%`,
        opacity: this.randomOpacity.toString(),
        transform: `rotate(${this.randomDegrees}deg)`
      },
      to: {
        top: '150%',
        left: `calc(${confetti.style.left} + ${Math.random() * 15 + '%'})`,
        transform: `rotate(${this.randomDegrees}deg)`
      }
    })
  }
}
