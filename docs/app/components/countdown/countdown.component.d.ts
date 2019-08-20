export declare class CountdownComponent extends HTMLElement {
    private currentSeconds;
    private currentSize;
    private isDone;
    private seconds;
    private doneText;
    private size;
    private onSecondsChange;
    private readonly done;
    private interval;
    private readonly sizeOrDefault;
    private readonly shouldIncreaseCurrentSize;
    disconnectedCallback(): void;
    private startCount;
    private stopCount;
    private reset;
    private increaseCurrentSize;
    private render;
}
