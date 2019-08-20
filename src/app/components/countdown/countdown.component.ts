import { CustomElement, Dispatch, DispatchEmitter, Prop, Watch } from 'custom-elements-ts';
import { animate } from '../../shared';

@CustomElement({
  tag: 'app-countdown'
})
export class CountdownComponent extends HTMLElement {
  private currentSeconds: number;
  private currentSize: number;
  private isDone: boolean;

  @Prop()
  private seconds: number;

  @Prop()
  private doneText: string;

  @Prop()
  private size: number;

  @Watch('seconds')
  private onSecondsChange() {
    if (this.seconds) {
      this.reset();
      this.render();
      this.stopCount();
      this.startCount();
    }
  }

  @Dispatch()
  private readonly done: DispatchEmitter;

  private interval: any;

  private get sizeOrDefault(): number {
    return this.size || 1;
  }

  private get shouldIncreaseCurrentSize(): boolean {
    return this.currentSeconds > 0 && this.currentSeconds < 4;
  }

  disconnectedCallback() {
    this.stopCount();
  }

  private startCount() {
    this.interval = setInterval(() => {
      this.currentSeconds--;

      if (this.shouldIncreaseCurrentSize) {
        this.increaseCurrentSize();
      }

      if (this.currentSeconds < 1) {
        this.isDone = true;
        this.done.emit();
        this.stopCount();
      }
      this.render();
    }, 1000);
  }

  private stopCount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private reset() {
    this.currentSeconds = this.seconds;
    this.currentSize = this.sizeOrDefault;
    this.isDone = false;
  }

  private increaseCurrentSize() {
    this.currentSize *= 1.5;
  }


  private async render() {
    this.shadowRoot.textContent = this.isDone ? this.doneText : this.currentSeconds.toString();
    await animate({
      element: this.shadowRoot.host,
      time: 0.5,
      from: { opacity: '0', fontSize: '1rem' },
      to: { opacity: '1', fontSize: `${this.currentSize}em` }
    });

    if (this.isDone) {
      this.increaseCurrentSize();
      animate({
        element: this.shadowRoot.host,
        time: 0.4,
        from: { opacity: '1' },
        to: { opacity: '0', fontSize: `${this.currentSize}em` }
      });
    }
  }
}
