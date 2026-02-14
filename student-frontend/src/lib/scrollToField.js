// Utility to scroll and focus to a form field by name or data-field
export function scrollToField(field) {
  if (!field) return;
  const element =
    document.querySelector(`[name="${field}"]`) ||
    document.querySelector(`[data-field="${field}"]`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      if (element.focus) {
        element.focus();
      } else {
        const trigger = element.querySelector("button");
        if (trigger) trigger.focus();
      }
    }, 300);
  }
}
