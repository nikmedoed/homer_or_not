import { renderGitHubTrending } from "./render/github-trending-widget.js";
import { applyWidgetLayout } from "./layout.js";
import { renderNewsFeedWidgets } from "./render/news-widget.js";
import { renderQuickLinks, renderSearchButtons } from "./render/search.js";
import {
  getEmptyServicesMessage,
  getVisibleServices,
  renderServices,
  setStatus,
  setStatusFromCurrentData,
} from "./render/services.js";
import { renderVisitPanels } from "./render/visits.js";
import { renderWeatherWidget } from "./render/weather-widget.js";

export {
  getEmptyServicesMessage,
  getVisibleServices,
  renderGitHubTrending,
  renderNewsFeedWidgets,
  renderQuickLinks,
  renderSearchButtons,
  renderServices,
  renderVisitPanels,
  renderWeatherWidget,
  setStatus,
  setStatusFromCurrentData,
};

export function renderAll(app) {
  renderSearchButtons(app);
  renderQuickLinks(app);
  renderNewsFeedWidgets(app);
  applyWidgetLayout(app);
  renderServices(app, getVisibleServices(app), getEmptyServicesMessage(app));
  renderWeatherWidget(app);
  renderGitHubTrending(app);
  renderVisitPanels(app);
  setStatusFromCurrentData(app);
}
