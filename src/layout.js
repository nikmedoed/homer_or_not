import { getNewsWidgetId, normalizeWidgetOrder } from "./state.js";

export const WIDGET_LABEL_KEYS = {
  services: "homerWidget",
  githubTrending: "githubTrending",
};

export function applyWidgetLayout(app) {
  const layout = app.refs.servicesLayout;
  if (!layout) {
    return;
  }
  const nodes = {
    services: app.refs.servicesGrid,
    githubTrending: app.refs.githubTrending,
  };
  for (const source of app.state?.news?.sources || []) {
    nodes[getNewsWidgetId(source.id)] = app.refs.newsWidgetNodes?.[source.id] || null;
  }
  for (const id of normalizeWidgetOrder(app.localPatch?.widgets?.order, app.state)) {
    const node = nodes[id];
    if (node) {
      layout.append(node);
    }
  }
  updateWidgetLayoutState(app);
}

export function updateWidgetLayoutState(app) {
  const layout = app.refs.servicesLayout;
  if (!layout) {
    return;
  }

  let hasFirstVisible = false;
  for (const node of layout.children) {
    node.classList.remove("first-visible-widget");
    if (hasFirstVisible || node.classList.contains("hidden")) {
      continue;
    }
    node.classList.add("first-visible-widget");
    hasFirstVisible = true;
  }
}
