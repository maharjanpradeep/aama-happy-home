import type { NavigateFunction } from "react-router-dom";

// Navigates to `path` (optionally "route#id") and scrolls to the target element,
// polling briefly since the target route may still be rendering after navigate().
export function scrollToSection(
  path: string,
  currentPathname: string,
  navigate: NavigateFunction
): void {
  const hashIndex = path.indexOf("#");
  const route = (hashIndex >= 0 ? path.slice(0, hashIndex) : path) || "/";
  const id = hashIndex >= 0 ? path.slice(hashIndex + 1) : "";

  const scrollToTarget = () => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      return true;
    }
    return false;
  };

  if (currentPathname === route) {
    scrollToTarget();
  } else {
    navigate(route);
    let tries = 0;
    const timer = setInterval(() => {
      if (scrollToTarget() || ++tries > 25) clearInterval(timer);
    }, 80);
  }
}
