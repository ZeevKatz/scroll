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
export declare class TinyGesture {
    private readonly element;
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
    handlers: Record<string, ((event: Event) => void)[]>;
    _onTouchStart: any;
    _onTouchMove: any;
    _onTouchEnd: any;
    constructor(element: HTMLElement, options?: Partial<TinyGestureOptions>);
    destroy(): void;
    on(type: string, fn: (() => void)): {
        type: string;
        fn: () => void;
        cancel: () => void;
    };
    off(type: string, fn: ((event: Event) => void)): void;
    fire(type: string, event: Event): void;
    onTouchStart(event: MouseEvent | TouchEvent): void;
    onTouchMove(event: MouseEvent | TouchEvent): void;
    onTouchEnd(event: MouseEvent | TouchEvent): void;
}
