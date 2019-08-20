export declare class ConfettiComponent extends HTMLElement {
    private static readonly selectors;
    private static readonly randomColor;
    private static readonly sizeRatio;
    private readonly quantity;
    private readonly size;
    private readonly speed;
    private readonly sizeOrDefault;
    private readonly speedOrDefault;
    private readonly randomWidth;
    private readonly randomHeight;
    private readonly randomTop;
    private readonly randomLeft;
    private readonly randomOpacity;
    private readonly randomDegrees;
    private readonly speedInMilliseconds;
    private readonly randomSpeedInMilliseconds;
    connectedCallback(): void;
    private fireConfetti;
    private createConfettiList;
    private createConfetti;
    private animateConfetti;
}
