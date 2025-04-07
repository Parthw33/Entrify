const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_ICON = path.join(__dirname, "../public/app-icon.png"); // Create this file
const ICONS_DIR = path.join(__dirname, "../public/icons");

// Create the icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

async function generateIcons() {
  console.log("Generating PWA icons...");

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error("Error: Source icon not found at", SOURCE_ICON);
    console.log(
      "Please create a square PNG image at least 512x512px at:",
      SOURCE_ICON
    );
    process.exit(1);
  }

  // Generate all icon sizes
  for (const size of ICON_SIZES) {
    const outputFile = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    console.log(`Generating ${outputFile}...`);

    try {
      await sharp(SOURCE_ICON).resize(size, size).toFile(outputFile);
    } catch (error) {
      console.error(`Error generating icon size ${size}:`, error);
    }
  }

  // Generate special icons
  const specialIcons = [
    { name: "register-icon.png", size: 96 },
    { name: "dashboard-icon.png", size: 96 },
    { name: "apple-icon.png", size: 180 },
    { name: "apple-touch-icon-precomposed.png", size: 180 },
    { name: "favicon.ico", size: 32 },
  ];

  for (const icon of specialIcons) {
    const outputFile = path.join(ICONS_DIR, icon.name);
    console.log(`Generating ${outputFile}...`);

    try {
      await sharp(SOURCE_ICON).resize(icon.size, icon.size).toFile(outputFile);
    } catch (error) {
      console.error(`Error generating special icon ${icon.name}:`, error);
    }
  }

  console.log("All icons generated successfully!");
}

generateIcons().catch(console.error);
