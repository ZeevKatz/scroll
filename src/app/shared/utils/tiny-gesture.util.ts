/**
 * TinyGesture.js
 *
 * This service uses passive listeners, so you can't call event.preventDefault()
 * on any of the events.
 *
 * Adapted from https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d
 * and https://github.com/uxitten/xwiper
 */

 export interface TinyGestureOptions {
  threshold: (type: any, self: any) => number;
  velocityThreshold: number;
  disregardVelocityThreshold: (type: any, self: any) => number;
  pressThreshold: number;
  diagonalSwipes: boolean;
  diagonalLimit: number;
  longPressTime: number;
  doubleTapTime: number;
  mouseSupport: boolean;
 }

 const DEFAULT_OPTIONS: TinyGestureOptions = {
  threshold: (type: any, self: any) => Math.max(25, Math.floor(0.15 * (type === 'x' ? window.innerWidth || document.body.clientWidth : window.innerHeight || document.body.clientHeight))),
  velocityThreshold: 10,
  disregardVelocityThreshold: (type, self) => Math.floor(0.5 * (type === 'x' ? self.element.clientWidth : self.element.clientHeight)),
  pressThreshold: 8,
  diagonalSwipes: false,
  diagonalLimit: Math.tan(45 * 1.5 / 180 * Math.PI),
  longPressTime: 500,
  doubleTapTime: 300,
  mouseSupport: true
};

export class TinyGesture {
  opts: TinyGestureOptions;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
  touchMoveX: number;
  touchMoveY: number;
  velocityX: number;
  velocityY: number;
  thresholdX: number;
  thresholdY: number;
  longPressTimer: any;
  doubleTapTimer: any;
  doubleTapWaiting: boolean;
  swipedVertical: boolean;
  disregardVelocityThresholdX: number;
  disregardVelocityThresholdY: number;
  swipingHorizontal: boolean;
  swipingVertical: boolean;
  swipingDirection: string;
  swipedHorizontal: boolean;
  handlers: Record<string, ((event: Event) => void)[]> = {
    'panstart': [],
    'panmove': [],
    'panend': [],
    'swipeleft': [],
    'swiperight': [],
    'swipeup': [],
    'swipedown': [],
    'tap': [],
    'doubletap': [],
    'longpress': []
  };

  _onTouchStart = this.onTouchStart.bind(this);
  _onTouchMove = this.onTouchMove.bind(this);
  _onTouchEnd = this.onTouchEnd.bind(this);

  constructor(private readonly element: HTMLElement, options?: Partial<TinyGestureOptions>) {
    this.element = element;
    this.opts = Object.assign({}, DEFAULT_OPTIONS, options);

    this.element.addEventListener('touchstart', this._onTouchStart, passiveIfSupported);
    this.element.addEventListener('touchmove', this._onTouchMove, passiveIfSupported);
    this.element.addEventListener('touchend', this._onTouchEnd, passiveIfSupported);

    if (this.opts.mouseSupport && !('ontouchstart' in window)) {
      this.element.addEventListener('mousedown', this._onTouchStart, passiveIfSupported);
      document.addEventListener('mousemove', this._onTouchMove, passiveIfSupported);
      document.addEventListener('mouseup', this._onTouchEnd, passiveIfSupported);
    }
  }

  destroy() {
    this.element.removeEventListener('touchstart', this._onTouchStart);
    this.element.removeEventListener('touchmove', this._onTouchMove);
    this.element.removeEventListener('touchend', this._onTouchEnd);
    this.element.removeEventListener('mousedown', this._onTouchStart);
    document.removeEventListener('mousemove', this._onTouchMove);
    document.removeEventListener('mouseup', this._onTouchEnd);
    clearTimeout(this.longPressTimer);
    clearTimeout(this.doubleTapTimer);
  }

  on(type: string, fn: (() => void)) {
    if (this.handlers[type]) {
      this.handlers[type].push(fn);
      return {
        type,
        fn,
        cancel: () => this.off(type, fn)
      };
    }
  }

  off(type: string, fn: ((event: Event) => void)) {
    if (this.handlers[type]) {
      const idx = this.handlers[type].indexOf(fn);
      if (idx !== -1) {
        this.handlers[type].splice(idx, 1);
      }
    }
  }

  fire(type: string, event: Event) {
    for (let i = 0; i < this.handlers[type].length; i++) {
      this.handlers[type][i](event);
    }
  }

  onTouchStart(event: MouseEvent | TouchEvent) {
    this.thresholdX = this.opts.threshold('x', this);
    this.thresholdY = this.opts.threshold('y', this);
    this.disregardVelocityThresholdX = this.opts.disregardVelocityThreshold('x', this);
    this.disregardVelocityThresholdY = this.opts.disregardVelocityThreshold('y', this);
    this.touchStartX = (event instanceof MouseEvent ? event.screenX : event.changedTouches[0].screenX);
    this.touchStartY = (event instanceof MouseEvent ? event.screenY : event.changedTouches[0].screenY);
    this.touchMoveX = null;
    this.touchMoveY = null;
    this.touchEndX = null;
    this.touchEndY = null;
    // Long press.
    this.longPressTimer = setTimeout(() => this.fire('longpress', event), this.opts.longPressTime);
    this.fire('panstart', event);
  }

  onTouchMove(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent && (!this.touchStartX || this.touchEndX !== null)) {
      return;
    }
    const touchMoveX = (event instanceof MouseEvent ? event.screenX : event.changedTouches[0].screenX) - this.touchStartX;
    this.velocityX = touchMoveX - this.touchMoveX;
    this.touchMoveX = touchMoveX;
    const touchMoveY = (event instanceof MouseEvent ? event.screenY : event.changedTouches[0].screenY) - this.touchStartY;
    this.velocityY = touchMoveY - this.touchMoveY;
    this.touchMoveY = touchMoveY;
    const absTouchMoveX = Math.abs(this.touchMoveX);
    const absTouchMoveY = Math.abs(this.touchMoveY);
    this.swipingHorizontal = absTouchMoveX > this.thresholdX;
    this.swipingVertical = absTouchMoveY > this.thresholdY;
    this.swipingDirection = absTouchMoveX > absTouchMoveY
      ? (this.swipingHorizontal ? 'horizontal' : 'pre-horizontal')
      : (this.swipingVertical ? 'vertical' : 'pre-vertical');
    if (Math.max(absTouchMoveX, absTouchMoveY) > this.opts.pressThreshold) {
      clearTimeout(this.longPressTimer);
    }
    this.fire('panmove', event);
  }

  onTouchEnd(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent && (!this.touchStartX || this.touchEndX !== null)) {
      return;
    }
    this.touchEndX = (event instanceof MouseEvent ? event.screenX : event.changedTouches[0].screenX);
    this.touchEndY = (event instanceof MouseEvent ? event.screenY : event.changedTouches[0].screenY);
    this.fire('panend', event);
    clearTimeout(this.longPressTimer);

    const x = this.touchEndX - this.touchStartX;
    const absX = Math.abs(x);
    const y = this.touchEndY - this.touchStartY;
    const absY = Math.abs(y);

    if (absX > this.thresholdX || absY > this.thresholdY) {
      this.swipedHorizontal = this.opts.diagonalSwipes ? Math.abs(x / y) <= this.opts.diagonalLimit : absX >= absY && absX > this.thresholdX;
      this.swipedVertical = this.opts.diagonalSwipes ? Math.abs(y / x) <= this.opts.diagonalLimit : absY > absX && absY > this.thresholdY;
      if (this.swipedHorizontal) {
        if (x < 0) {
          // Left swipe.
          if (this.velocityX < -this.opts.velocityThreshold || x < -this.disregardVelocityThresholdX) {
            this.fire('swipeleft', event);
          }
        } else {
          // Right swipe.
          if (this.velocityX > this.opts.velocityThreshold || x > this.disregardVelocityThresholdX) {
            this.fire('swiperight', event);
          }
        }
      }
      if (this.swipedVertical) {
        if (y < 0) {
          // Upward swipe.
          if (this.velocityY < -this.opts.velocityThreshold || y < -this.disregardVelocityThresholdY) {
            this.fire('swipeup', event);
          }
        } else {
          // Downward swipe.
          if (this.velocityY > this.opts.velocityThreshold || y > this.disregardVelocityThresholdY) {
            this.fire('swipedown', event);
          }
        }
      }
    } else if (absX < this.opts.pressThreshold && absY < this.opts.pressThreshold) {
      // Tap.
      if (this.doubleTapWaiting) {
        this.doubleTapWaiting = false;
        clearTimeout(this.doubleTapTimer);
        this.fire('doubletap', event);
      } else {
        this.doubleTapWaiting = true;
        this.doubleTapTimer = setTimeout(() => this.doubleTapWaiting = false, this.opts.doubleTapTime);
        this.fire('tap', event);
      }
    }
  }
};

// Passive feature detection.
let passiveIfSupported = false;

try {
  window.addEventListener('test', null, Object.defineProperty({}, 'passive', { get: function() { passiveIfSupported = true; } }));
} catch (err) {}