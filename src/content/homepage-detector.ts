import { HOME_PATHS } from "../shared/constants";
import type { LocationLike } from "../shared/models";
import { locateHomepageModules } from "./module-locator";

const CHESS_COM_HOSTS = new Set(["www.chess.com", "chess.com"]);

export function isChessComHomepage(
  document: Document,
  location: LocationLike
): boolean {
  if (
    location.protocol !== "https:" ||
    !CHESS_COM_HOSTS.has(location.hostname.toLowerCase()) ||
    !HOME_PATHS.has(location.pathname)
  ) {
    return false;
  }

  if (!document.documentElement.classList.contains("user-logged-in")) {
    return false;
  }

  const profileLandmark = document.querySelector(
    '[data-cy="profile-section"] [data-page="home"][data-button="profile"], ' +
      '[data-cy="user-avatar"][data-page="home"], ' +
      '[data-cy="user-avatar"], ' +
      '[data-cy="profile-section"] a[href*="/member/"]'
  );

  const modules = locateHomepageModules(document);
  const desktopLandmarks = Boolean(
    modules.promo && modules.leftColumn && modules.rightColumn
  );
  const responsiveLandmarks = Boolean(
    modules.layoutMode === "responsive" &&
      modules.leftColumn &&
      modules.nativeLaunchTemplate &&
      (modules.gameHistory || modules.dailyGames || modules.stats)
  );

  return Boolean(profileLandmark && (desktopLandmarks || responsiveLandmarks));
}
