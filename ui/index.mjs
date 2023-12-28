import { byId } from "./byId.mjs";

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
