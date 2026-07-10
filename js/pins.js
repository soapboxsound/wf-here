const PIN_PATH =
  "M0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7C14 8.48601 13.519 9.85901 12.702 10.976L7 22L1.29799 10.976C0.480995 9.85901 0 8.48601 0 7ZM7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z";

const SVG_NS = "http://www.w3.org/2000/svg";

export function createPin({
  type = "standard",
  size = "lg",
  name = "",
  showLabel = false
} = {}) {
  const wrapper = document.createElement("div");
  const pinTypeClass = type === "featured" ? "pin-featured" : "pin-standard";
  const pinSizeClass = ["lg", "md", "sm"].includes(size) ? `pin-${size}` : "pin-lg";

  wrapper.className = `map-pin ${pinTypeClass}`;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 14 22");
  svg.setAttribute("class", pinSizeClass);
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("clip-rule", "evenodd");
  path.setAttribute("d", PIN_PATH);

  svg.appendChild(path);
  wrapper.appendChild(svg);

  if (showLabel && name) {
    const label = document.createElement("span");
    label.className = "pin-label";
    label.textContent = name;
    wrapper.appendChild(label);
  }

  return wrapper;
}
