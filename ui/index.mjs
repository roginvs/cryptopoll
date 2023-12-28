/**
 *
 * @param {string} id
 */
function byId(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element ${id} not found!`);
  }
  return el;
}
const pages = byId("pages");
const learn_more = byId("learn_more");

pages.addEventListener("scroll", (e) => {
  const isArrowHidden =
    pages.scrollHeight - pages.offsetHeight - pages.scrollTop < 200;
  learn_more.style.display = isArrowHidden ? "none" : "";
});

learn_more.addEventListener("click", () => {
  pages.scrollTop += pages.offsetHeight;
});
