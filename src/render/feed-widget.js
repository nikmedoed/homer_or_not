export function renderFeedWidget({
  section,
  list,
  meta,
  refreshButton,
  title,
  sourceLabel,
  status,
  items,
  emptyText,
  sourceText,
  updatedText,
  staleText,
  updatedTitle,
  rowsHtml = "",
  afterRowsRendered = null,
  createRow,
}) {
  const hasItems = items.length > 0;
  section.classList.toggle("hidden", !hasItems && !status);
  section.dataset.state = status?.kind || (hasItems ? "ready" : "empty");
  refreshButton.disabled = status?.kind === "loading";
  list.replaceChildren();

  const heading = section.querySelector("[data-feed-title]");
  if (heading) {
    heading.textContent = title;
  }
  section.setAttribute("aria-label", title);

  if (!hasItems) {
    const empty = document.createElement("p");
    empty.className = "feed-message";
    empty.textContent = status?.message || emptyText;
    list.append(empty);
    meta.textContent = sourceText || sourceLabel || "";
    meta.title = "";
    return;
  }

  if (rowsHtml) {
    list.innerHTML = rowsHtml;
  } else {
    for (const item of items) {
      list.append(createRow(item));
    }
    if (typeof afterRowsRendered === "function") {
      afterRowsRendered(list.innerHTML);
    }
  }

  if (status?.kind === "error") {
    meta.textContent = staleText;
    meta.title = [status.message, updatedTitle].filter(Boolean).join(" · ");
    return;
  }

  meta.textContent = updatedText || sourceText || sourceLabel || "";
  meta.title = updatedTitle || "";
}
