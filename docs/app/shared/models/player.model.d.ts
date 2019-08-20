export declare type PlayerId = 'one' | 'two';
export declare class Player {
    private _wins;
    getWins(): number;
    addWin(): void;
    resetWins(): void;
}
