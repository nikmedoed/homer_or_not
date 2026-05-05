import { formatRepositoryAge, formatStars, getGitHubTrendingSummary } from "../github-trending.js";
import { t } from "../i18n.js";
import { updateWidgetLayoutState } from "../layout.js";
import { makeInitial } from "../utils.js";

export function renderGitHubTrending(app) {
  const { refs } = app;
  if (!refs.githubTrending) {
    return;
  }
  if (app.localPatch?.githubTrending?.disabled) {
    refs.githubTrending.classList.add("hidden");
    updateWidgetLayoutState(app);
    return;
  }

  const status = app.githubTrendingStatus;
  const summary = getGitHubTrendingSummary(app.githubTrendingCache);
  const hasItems = summary.items.length > 0;
  refs.githubTrending.classList.toggle("hidden", !hasItems && !status);
  updateWidgetLayoutState(app);
  refs.githubTrending.dataset.state = status?.kind || (hasItems ? "ready" : "empty");
  refs.githubTrendingRefreshButton.disabled = status?.kind === "loading";
  refs.githubTrendingList.replaceChildren();

  if (!hasItems) {
    const empty = document.createElement("p");
    empty.className = "github-trending-message";
    empty.textContent = status?.message || t("githubTrendingUnavailable");
    refs.githubTrendingList.append(empty);
    refs.githubTrendingMeta.textContent = t("githubTrendingSource");
    return;
  }

  for (const item of summary.items) {
    refs.githubTrendingList.append(createGitHubTrendingRow(app, item));
  }

  if (status?.kind === "error") {
    refs.githubTrendingMeta.textContent = t("githubTrendingStale", summary.updatedAt);
    refs.githubTrendingMeta.title = [status.message, summary.updatedAtTitle].filter(Boolean).join(" · ");
    return;
  }

  refs.githubTrendingMeta.textContent = summary.updatedAt
    ? t("githubTrendingUpdated", summary.updatedAt)
    : t("githubTrendingSource");
  refs.githubTrendingMeta.title = summary.updatedAtTitle;
}

function createGitHubTrendingRow(app, item) {
  const anchor = document.createElement("a");
  anchor.className = "github-trending-row";
  anchor.href = item.url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.title = item.description || item.fullName;
  anchor.addEventListener("click", () => {
    void app.addVisitHistoryItem({
      title: item.fullName,
      url: item.url,
      source: "github",
    });
  });

  const avatar = document.createElement("span");
  avatar.className = "github-trending-avatar";
  if (item.ownerAvatarUrl) {
    const image = document.createElement("img");
    image.src = item.ownerAvatarUrl;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      avatar.textContent = makeInitial(item.name);
    });
    avatar.append(image);
  } else {
    avatar.textContent = makeInitial(item.name);
  }

  const body = document.createElement("span");
  body.className = "github-trending-body";

  const title = document.createElement("span");
  title.className = "github-trending-name";
  title.textContent = item.fullName;

  const description = document.createElement("span");
  description.className = "github-trending-description";
  description.textContent = item.description || t("githubTrendingNoDescription");

  const meta = document.createElement("span");
  meta.className = "github-trending-repo-meta";
  const stars = formatStars(item.stars);
  meta.textContent = [stars ? `★ ${stars}` : "", item.language, formatRepositoryAge(item)].filter(Boolean).join(" · ");

  body.append(title, description, meta);
  anchor.append(avatar, body);
  return anchor;
}
