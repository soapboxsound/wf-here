import { logOut, onAuthChange } from "/js/auth.js";

const navSignIn = document.getElementById("navSignIn");
const navUserMenu = document.getElementById("navUserMenu");
const navUserName = document.getElementById("navUserName");
const navSignOut = document.getElementById("navSignOut");
const mobileSignInLinks = document.querySelectorAll(".nav-mobile-sign-in");

function setSignedOutState() {
  if (navSignIn) {
    navSignIn.style.display = "";
  }

  if (navUserMenu) {
    navUserMenu.style.display = "none";
  }

  mobileSignInLinks.forEach((link) => {
    link.style.display = "";
  });
}

function setSignedInState(user) {
  const label = user.displayName || user.email || "Account";

  if (navUserName) {
    navUserName.textContent = label;
  }

  if (navSignIn) {
    navSignIn.style.display = "none";
  }

  if (navUserMenu) {
    navUserMenu.style.display = "flex";
  }

  mobileSignInLinks.forEach((link) => {
    link.style.display = "none";
  });
}

if (navSignOut) {
  navSignOut.addEventListener("click", async (event) => {
    event.preventDefault();
    await logOut();
    window.location.reload();
  });
}

onAuthChange((user) => {
  if (user) {
    setSignedInState(user);
  } else {
    setSignedOutState();
  }
});
