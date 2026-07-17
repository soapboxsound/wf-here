import { auth } from "/js/firebase.js";
import { saveSpot, unsaveSpot } from "/js/db.js";

const WIFI_CONFIG = {
  great: {
    label: "great wifi",
    color: "var(--color-wifi-great)"
  },
  decent: {
    label: "decent wifi",
    color: "var(--color-wifi-decent)"
  },
  poor: {
    label: "poor wifi",
    color: "var(--color-wifi-poor)"
  }
};

const WIFI_QUALITY_MAP = {
  slow: "poor",
  poor: "poor",
  decent: "decent",
  fast: "great",
  blazing: "great",
  great: "great"
};

function formatType(type = "") {
  return type.replace(/-/g, " ");
}

function formatFood(food = "") {
  return food.replace(/-/g, " ");
}

function formatOutlets(outlets = "") {
  return outlets === "plenty" ? "outlets" : outlets;
}

function getGoogleWeekdayIndex(date = new Date()) {
  // Google weekday_text is Monday-first; JS getDay() is Sunday-first.
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function formatHoursForCard(hours = "", date = new Date()) {
  if (!hours) {
    return "";
  }

  const dayNames = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];
  const todayIndex = getGoogleWeekdayIndex(date);
  const todayName = dayNames[todayIndex];
  const lines = hours
    .split(/\n|·/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return "";
  }

  let todayLine =
    lines.find((line) => line.toLowerCase().startsWith(`${todayName}:`)) ||
    lines.find((line) => line.toLowerCase().startsWith(todayName));

  if (!todayLine && lines.length === 7) {
    todayLine = lines[todayIndex];
  }

  // Freeform hours without day labels (e.g. "7am - 6pm daily") — keep as-is.
  if (!todayLine) {
    const hasDayLabels = lines.some((line) =>
      dayNames.some((day) => line.toLowerCase().includes(day))
    );

    if (!hasDayLabels) {
      todayLine = lines[0];
    } else {
      return "";
    }
  }

  let value = todayLine.replace(/^[A-Za-z]+day:\s*/i, "").trim();

  if (!value) {
    return "";
  }

  if (/^closed$/i.test(value)) {
    return "Closed today";
  }

  if (/daily|every day|24\s*hrs?|open 24/i.test(todayLine) && !todayLine.toLowerCase().includes(todayName)) {
    return value.length <= 42 ? value : `${value.slice(0, 39).trim()}…`;
  }

  const label = value.length <= 36 ? value : `${value.slice(0, 33).trim()}…`;
  return `Today ${label}`;
}

function deriveAttributes(spot) {
  if (Array.isArray(spot.attributes) && spot.attributes.length) {
    return spot.attributes;
  }

  const attributes = [];

  if (spot.wifiSpeed === "fast" || spot.wifiSpeed === "blazing") {
    attributes.push("fast wifi");
  } else if (spot.wifiSpeed === "decent") {
    attributes.push("wifi");
  }

  if (spot.outlets) {
    attributes.push(formatOutlets(spot.outlets));
  }

  if (spot.noiseLevel) {
    attributes.push(spot.noiseLevel.replace(/-/g, " "));
  }

  if (spot.food && spot.food !== "none") {
    attributes.push(formatFood(spot.food));
  }

  if (spot.costToSit === "free") {
    attributes.push("free");
  }

  return attributes.slice(0, 4);
}

function setSpotSaveIcon(icon, saved) {
  icon.classList.toggle("is-saved", saved);
  icon.classList.toggle("ti-heart-filled", saved);
  icon.classList.toggle("ti-heart", !saved);
}

async function toggleSpotSave(spot, icon) {
  if (!spot.slug) {
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "/login";
    return;
  }

  const isSaved = icon.classList.contains("is-saved");

  if (isSaved) {
    await unsaveSpot(user.uid, spot.slug);
    setSpotSaveIcon(icon, false);
    return;
  }

  await saveSpot(user.uid, { slug: spot.slug, name: spot.name });
  setSpotSaveIcon(icon, true);
}

export function createSpotCard(spot) {
  const card = document.createElement("div");
  card.className = "spot-card";
  card.tabIndex = 0;

  if (spot.slug) {
    card.dataset.slug = spot.slug;
  }

  if (spot.featured) {
    card.classList.add("featured");
  }

  const saveIconClass = spot.saved ? "ti ti-heart-filled" : "ti ti-heart";
  const attributes = deriveAttributes(spot);
  const spotType = formatType(spot.type);
  const signal = getSignalFromSpot(spot);
  const showScore = Number(spot.wfScore) > 0;

  const attrsMarkup = attributes
    .map((attribute) => `<span class="spot-attr">${attribute}</span>`)
    .join("");
  const hoursLabel = formatHoursForCard(spot.hours);
  const scoreMarkup = showScore
    ? `<div class="wf-score-badge"><span class="wf-score-num">${Number(spot.wfScore).toFixed(1)}</span><span class="wf-score-label">${spot.wfScoreLabel || ""}</span></div>`
    : "";
  const signalMarkup = signal
    ? `<span class="indicator-pill signal-${signal}">${signal}</span>`
    : "";

  card.innerHTML = `
    <div class="spot-card-name-row">
      <div class="spot-card-title">
        <div class="spot-name-line">
          <span class="spot-name">${spot.name}</span>
          ${spot.featured ? '<span class="spot-featured-badge">featured</span>' : ""}
        </div>
        <span class="spot-meta">${spotType} · ${spot.neighborhood || "—"}${spot.distanceLabel ? ` · ${spot.distanceLabel}` : ""}</span>
      </div>
      <i class="spot-save ${saveIconClass}${spot.saved ? " is-saved" : ""}"></i>
    </div>
    ${scoreMarkup}
    <div class="spot-attrs">${attrsMarkup}</div>
    <div class="spot-card-footer">
      ${signalMarkup}
      ${hoursLabel ? `<span class="spot-hours">${hoursLabel}</span>` : ""}
    </div>
  `;

  if (spot.slug) {
    const navigateToSpot = () => {
      window.location.href = `/place?slug=${encodeURIComponent(spot.slug)}`;
    };

    card.addEventListener("click", navigateToSpot);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToSpot();
      }
    });
  }

  const saveIcon = card.querySelector(".spot-save");
  if (saveIcon && spot.slug) {
    saveIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSpotSave(spot, saveIcon);
    });
  }

  return card;
}

function getSignalFromSpot(spot = {}) {
  if (spot.adminRating?.signal) {
    return spot.adminRating.signal;
  }

  return WIFI_QUALITY_MAP[spot.wifiSpeed] || spot.wifiQuality || "";
}

export function createWfScoreDetail(listing = {}) {
  const detail = document.createElement("div");
  detail.className = "wf-score-detail";

  const rating = listing.adminRating || {};
  const score = Number(listing.wfScore) || 0;
  const label = listing.wfScoreLabel || "";
  const reviewCount = Number(listing.reviewCount) || 0;
  const reviewText = reviewCount > 0
    ? `${reviewCount} rating${reviewCount === 1 ? "" : "s"}`
    : "admin pick";

  detail.innerHTML = `
    <div class="wf-score-detail-top">
      <span class="wf-score-detail-num">${score ? score.toFixed(1) : "—"}</span>
      <span class="wf-score-detail-label">${label}</span>
      <span class="wf-score-detail-count">${reviewText}</span>
    </div>
    <div class="indicator-row">
      <span class="indicator-name">Signal</span>
      <span class="indicator-pill signal-${rating.signal || "decent"}">${rating.signal || "—"}</span>
    </div>
    <div class="indicator-row">
      <span class="indicator-name">Volume</span>
      <span class="indicator-pill volume-${rating.volume || "moderate"}">${rating.volume || "—"}</span>
    </div>
    <div class="indicator-row">
      <span class="indicator-name">Power</span>
      <span class="indicator-pill power-${rating.power || "some"}">${rating.power || "—"}</span>
    </div>
    <div class="indicator-row">
      <span class="indicator-name">Vibe</span>
      <span class="indicator-pill vibe">${rating.vibe || "—"}</span>
    </div>
  `;

  return detail;
}

export function createRatingWidget(existingRating = null) {
  const widget = document.createElement("div");
  widget.className = "rating-widget";

  const selected = {
    signal: existingRating?.signal || "",
    volume: existingRating?.volume || "",
    power: existingRating?.power || "",
    vibe: existingRating?.vibe || ""
  };

  const categories = [
    { key: "signal", label: "Signal", options: ["great", "decent", "poor"] },
    { key: "volume", label: "Volume", options: ["quiet", "moderate", "loud"] },
    { key: "power", label: "Power", options: ["plenty", "some", "none"] }
  ];

  categories.forEach((category) => {
    const row = document.createElement("div");
    row.className = "rating-row";
    row.dataset.category = category.key;

    const name = document.createElement("span");
    name.className = "indicator-name";
    name.textContent = category.label;
    row.appendChild(name);

    const options = document.createElement("div");
    options.className = "rating-options";

    category.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `rating-option ${category.key}-${option}`;
      button.dataset.value = option;
      button.textContent = option;

      if (selected[category.key] === option) {
        button.classList.add("is-active");
      }

      button.addEventListener("click", () => {
        selected[category.key] = option;
        options.querySelectorAll(".rating-option").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
      });

      options.appendChild(button);
    });

    row.appendChild(options);
    widget.appendChild(row);
  });

  const vibeRow = document.createElement("div");
  vibeRow.className = "rating-row rating-row-vibe";
  vibeRow.dataset.category = "vibe";

  const vibeName = document.createElement("span");
  vibeName.className = "indicator-name";
  vibeName.textContent = "Vibe";
  vibeRow.appendChild(vibeName);

  const vibeOptions = document.createElement("div");
  vibeOptions.className = "rating-vibe-options";

  Object.keys({
    "laptop friendly": 9,
    "good energy": 8,
    "hidden gem": 9,
    "great coffee": 7,
    "neighborhood spot": 8,
    "open and airy": 8,
    "quiet corners": 9,
    "24hr access": 10,
    "outdoor space": 7,
    "dog friendly": 7
  }).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rating-option vibe";
    button.dataset.value = option;
    button.textContent = option;

    if (selected.vibe === option) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      selected.vibe = option;
      vibeOptions.querySelectorAll(".rating-option").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
    });

    vibeOptions.appendChild(button);
  });

  vibeRow.appendChild(vibeOptions);
  widget.appendChild(vibeRow);

  widget.getSelectedRating = () => ({ ...selected });
  widget.isComplete = () => Boolean(selected.signal && selected.volume && selected.power && selected.vibe);

  return widget;
}

export const EXPLORE_FILTER_OPTIONS = [
  { value: "all", label: "all" },
  { value: "fast wifi", label: "fast wifi" },
  { value: "quiet", label: "quiet" },
  { value: "food", label: "food" },
  { value: "outlets", label: "outlets" },
  { value: "open late", label: "open late" },
  { value: "free", label: "free" },
  { value: "open now", label: "open now" }
];

export const NOISE_LEVEL_OPTIONS = [
  { value: "library quiet", label: "library quiet" },
  { value: "moderate", label: "moderate" },
  { value: "lively", label: "lively" },
  { value: "loud", label: "loud" }
];

export const COST_TO_SIT_OPTIONS = [
  { value: "completely free", label: "completely free" },
  { value: "buy something", label: "buy something" },
  { value: "paid or membership", label: "paid or membership" }
];

export const ATTRIBUTE_OPTIONS = [
  { value: "fast wifi", label: "fast wifi" },
  { value: "outlets everywhere", label: "outlets everywhere" },
  { value: "quiet", label: "quiet" },
  { value: "good food", label: "good food" },
  { value: "good coffee", label: "good coffee" },
  { value: "open late", label: "open late" },
  { value: "outdoor seating", label: "outdoor seating" },
  { value: "natural light", label: "natural light" },
  { value: "free to sit", label: "free to sit" },
  { value: "laptop friendly", label: "laptop friendly" }
];

export const WIFI_SPEED_OPTIONS = [
  { value: "slow", label: "slow" },
  { value: "decent", label: "decent" },
  { value: "fast", label: "fast" },
  { value: "blazing", label: "blazing" }
];

export const OUTLET_OPTIONS = [
  { value: "plenty", label: "plenty" },
  { value: "some", label: "some" },
  { value: "none", label: "none" }
];

export const FOOD_OPTIONS = [
  { value: "coffee-only", label: "coffee only" },
  { value: "coffee-and-food", label: "coffee + food" },
  { value: "full-menu", label: "full menu" },
  { value: "none", label: "none" }
];

export const SEATING_OPTIONS = [
  { value: "tables", label: "tables" },
  { value: "bar", label: "bar" },
  { value: "couches", label: "couches" },
  { value: "standing", label: "standing" },
  { value: "outdoor", label: "outdoor" }
];

export const VIBE_TAG_OPTIONS = [
  { value: "neighborhood gem", label: "neighborhood gem" },
  { value: "laptop friendly", label: "laptop friendly" },
  { value: "good music", label: "good music" },
  { value: "not too crowded", label: "not too crowded" },
  { value: "natural light", label: "natural light" },
  { value: "regulars crowd", label: "regulars crowd" },
  { value: "good coffee", label: "good coffee" },
  { value: "gets busy midday", label: "gets busy midday" },
  { value: "quiet corners", label: "quiet corners" },
  { value: "large space", label: "large space" },
  { value: "open late", label: "open late" }
];

export function createChipGroup(groupName, options, multiSelect) {
  const group = document.createElement("div");
  group.className = "chip-group";

  const buttons = options.map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = option.label;
    button.dataset.value = option.value;

    if (groupName === "wifi speed") {
      button.dataset.color = option.value;
    }

    return button;
  });

  const setChipState = (button, active) => {
    button.classList.toggle("is-active", active);
    document.dispatchEvent(
      new CustomEvent("chipToggle", {
        detail: {
          groupName,
          value: button.dataset.value,
          active
        }
      })
    );
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isAllChip = button.dataset.value === "all";
      const isActive = button.classList.contains("is-active");

      if (multiSelect) {
        if (isAllChip) {
          buttons.forEach((item) => {
            setChipState(item, item === button);
          });
          return;
        }

        const allChip = buttons.find((item) => item.dataset.value === "all");
        if (allChip && allChip.classList.contains("is-active")) {
          setChipState(allChip, false);
        }
        setChipState(button, !isActive);
        return;
      }

      buttons.forEach((item) => {
        setChipState(item, item === button ? !isActive : false);
      });
    });
  });

  buttons.forEach((button) => group.appendChild(button));
  return group;
}
