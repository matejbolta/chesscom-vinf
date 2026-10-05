import { isChessComGame } from './game-continuation';
import { isChessComLiveGameReview, isChessComGameAnalysis } from './game-review-layout-controller';
import { OpponentRatingIntro } from './opponent-rating-intro';
import { NativeGameEndState } from './extreme-oled-controller';
import { MaterialFlow } from './material-flow';
import { ReviewRowActions } from './review-row-actions';
import type { ExtensionSettings, LocationLike } from '../shared/models';

export class WideBoardRows {
  private ratingIntro = new OpponentRatingIntro();
  private gameEnd = new NativeGameEndState();
  private material = new MaterialFlow();
  private reviewActions = new ReviewRowActions();
  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, wide: boolean): void {
    const review = isChessComLiveGameReview(location);
    const active = wide && settings.enabled && document.documentElement.classList.contains('user-logged-in') &&
      (isChessComGame(location) || review || isChessComGameAnalysis(location));
    document.documentElement.toggleAttribute('data-chesscom-vinf-wide-rows', active);
    document.documentElement.toggleAttribute('data-chesscom-vinf-wide-extreme', active && settings.extremeOled);
    document.documentElement.toggleAttribute('data-chesscom-vinf-wide-game-rows', active && isChessComGame(location));
    if (active) this.material.reconcile(document); else this.material.cleanup();
    if (active && isChessComGame(location) && !this.gameEnd.read(document, location.pathname)) {
      this.ratingIntro.reconcile(document, location.pathname);
    } else this.ratingIntro.cleanup();
    this.reviewActions.reconcile(document, active && review);
  }
}
