import { byId } from "./byId.mjs";

const pages = byId("pages");
const learn_more = byId("learn_more");
const learn_more_text = byId("learn_more_text");

pages.addEventListener("scroll", (e) => {
  const isArrowHidden =
    pages.scrollHeight - pages.offsetHeight - pages.scrollTop < 200;
  learn_more.style.display = isArrowHidden ? "none" : "";

  const isTextHidden = pages.scrollTop > 200;
  learn_more_text.style.opacity = isTextHidden ? "0" : "0.7";
});

learn_more.addEventListener("click", () => {
  pages.scrollTop += pages.offsetHeight;
});

function addShowingAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        if (target instanceof HTMLElement) {
          target.style.opacity = entry.isIntersecting ? "1" : "0";
          target.style.transform = entry.isIntersecting
            ? "translateX(0%)"
            : "translateX(5%)";
        }
      });
    },
    {
      //root: el,
      rootMargin: "0px",
      threshold: 0,
    }
  );
  document
    .querySelectorAll(".welcome_container p, .welcome_container h1")
    .forEach((el) => {
      observer.observe(el);
      if (el instanceof HTMLElement) {
        el.style.transition = "all 300ms ease-out";
        el.style.transitionDelay =
          el.tagName === "P" ? "600ms" : el.tagName === "H1" ? "300ms" : "";
      }
    });
}

document.querySelectorAll("img").forEach((el, key) => {
  setTimeout(() => {
    el.removeAttribute("loading");
  }, key * 300);
});

addShowingAnimations();
