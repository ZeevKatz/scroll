import { AppComponent } from './app/app.component';
import { HomeView, GameView, WinnerView } from './app/views';
import { ButtonComponent, ConfettiComponent, CountdownComponent } from './app/components';

export {
  AppComponent,
  HomeView,
  GameView,
  WinnerView,
  ButtonComponent,
  ConfettiComponent,
  CountdownComponent
};

declare global {
  interface HTMLElementTagNameMap {
      'app-root': AppComponent;
      'home-view': HomeView;
      'game-view': GameView;
      'winner-view': WinnerView;
      'app-button': ButtonComponent;
      'app-confetti': ConfettiComponent;
      'app-countdown': CountdownComponent;
  }
}

// TODO?: Music = https://js13kgames.github.io/resources/