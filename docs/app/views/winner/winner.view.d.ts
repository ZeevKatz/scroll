import { PlayerId } from '../../shared';
export declare class WinnerView extends HTMLElement {
    private $cupIconContainer;
    private $title;
    private $confetti;
    private $quitButton;
    private $fightAgainButton;
    private $winnerContainer;
    private $strippedBackground;
    private $backgroundContainers;
    playerId: PlayerId;
    private readonly fightAgain;
    private readonly quit;
    connectedCallback(): Promise<void>;
    private onPlayerIdChange;
    private onFightAgainButtonClick;
    private onQuitButtonClick;
    private animateView;
}
