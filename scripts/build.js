const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const staticPaths = [
  "index.html",
  "css",
  "js",
  "assets",
  "admin",
  "explore",
  "place",
  "submit",
  "login",
  "profile",
  "for-businesses",
  "new-york",
  "los-angeles",
  "robots.txt",
  "sitemap.xml"
];

require("./generate-config.js");

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true });
}

fs.mkdirSync(publicDir, { recursive: true });

staticPaths.forEach((item) => {
  const sourcePath = path.join(rootDir, item);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`Skipping missing path: ${item}`);
    return;
  }

  fs.cpSync(sourcePath, path.join(publicDir, item), { recursive: true });
});

console.log(`Built static site into ${publicDir}`);
