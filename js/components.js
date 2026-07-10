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

  const wifiKey = spot.wifiQuality || WIFI_QUALITY_MAP[spot.wifiSpeed] || "decent";
  const wifi = WIFI_CONFIG[wifiKey] || WIFI_CONFIG.decent;
  const saveIconClass = spot.saved ? "ti ti-heart-filled" : "ti ti-heart";
  const attributes = deriveAttributes(spot);
  const spotType = formatType(spot.type);

  const attrsMarkup = attributes
    .map((attribute) => `<span class="spot-attr">${attribute}</span>`)
    .join("");

  card.innerHTML = `
    <div class="spot-card-name-row">
      <div class="spot-card-title">
        <div class="spot-name-line">
          <span class="spot-name">${spot.name}</span>
          ${spot.featured ? '<span class="spot-featured-badge">featured</span>' : ""}
        </div>
        <span class="spot-meta">${spotType} · ${spot.neighborhood}</span>
      </div>
      <i class="spot-save ${saveIconClass}${spot.saved ? " is-saved" : ""}"></i>
    </div>
    <div class="spot-attrs">${attrsMarkup}</div>
    <div class="spot-card-footer">
      <div class="spot-wifi" style="color: ${wifi.color};">
        <span class="spot-wifi-dot"></span>
        <span>${wifi.label}</span>
      </div>
      <span class="spot-hours">${spot.hours}</span>
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
