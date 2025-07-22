const p = {
  bookmarksCreate: (data) =>
    new Promise((resolve, reject) =>
      chrome.bookmarks.create(data, (res) =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(res)
      )
    ),
  windowsGetAll: (opts) =>
    new Promise((resolve, reject) =>
      chrome.windows.getAll(opts, (res) =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(res)
      )
    )
};

async function bookmarkAll(folderTitle) {
  console.log("Creating new bookmarks in", folderTitle);

  // Create the folder
  const folder = await p.bookmarksCreate({ title: folderTitle });

  // Get all windows & tabs
  const windows = await p.windowsGetAll({ populate: true });

  let count = 0;
  for (const win of windows) {
    for (const tab of win.tabs) {
      // Skip chrome://, edge://, etc.
      if (!tab.url || !/^https?:/i.test(tab.url)) continue;

      await p.bookmarksCreate({
        parentId: folder.id,
        title: tab.title || tab.url,
        url: tab.url
      });
      count++;
    }
  }
  return { folderId: folder.id, count };
}

// Message router
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "BOOKMARK_ALL") {
    bookmarkAll(msg.folderTitle)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true; // keep channel open for async
  }
});
