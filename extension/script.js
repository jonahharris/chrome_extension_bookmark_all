function toShortISODateString(d) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate())
  );
}

$(function () {
  const defaultTitle = toShortISODateString(new Date());
  $("#folderName").val(defaultTitle);
  console.log("Default folder name:", defaultTitle);

  $("form").on("submit", function (e) {
    e.preventDefault();

    const folderTitle = $("#folderName").val().trim() || defaultTitle;

    chrome.runtime.sendMessage(
      { type: "BOOKMARK_ALL", folderTitle },
      (res) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else if (!res?.ok) {
          console.error(res?.error || "Unknown error");
        } else {
          console.log(`Bookmarked ${res.count} tabs into folder ${folderTitle}`);
        }
        // Close AFTER we get a response to avoid the race
        window.close();
      }
    );
  });
});
