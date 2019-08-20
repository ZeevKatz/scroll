import { AniX } from 'anix';
import { IEase } from 'anix/ease';

import { AnimateOptions } from '../interfaces';

export const Easing: IEase = AniX.ease;

export function animate(options: AnimateOptions): Promise<void> {
  return new Promise((resolve) => {
    const elements = options.element instanceof Element ? [options.element] : options.element;
    const from = options.reverse ? options.to : options.from;
    const to = options.reverse ? options.from : options.to;
    const ease = options.ease || Easing.easeInOutBack;
    const delay = options.delay || 0;
    const toWithDefault = Object.assign({ onComplete: () => resolve(), ease, delay }, to);
    elements.forEach(element => {
      if (from && to) {
        AniX.fromTo(element, options.time, from, toWithDefault);
      } else {
        AniX.to(element, options.time, toWithDefault);
      }
    });
  });
}