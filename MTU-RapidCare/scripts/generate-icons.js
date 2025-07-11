const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG content based on your Logo.tsx component
const generateSVG = (size, primaryColor = '#2563eb', foregroundColor = '#ffffff', accentColor = '#3b82f6') => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="30" fill="${primaryColor}"/>
  <path d="M100 40 L100 160 M60 100 L140 100" stroke="${foregroundColor}" stroke-width="20" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="25" fill="${accentColor}"/>
</svg>`;
};

// Create assets/images directory if it doesn't exist
const assetsDir = path.join(__dirname, '../assets/images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Generate app icon (1024x1024)
    const appIconSVG = generateSVG(1024);
    fs.writeFileSync(path.join(assetsDir, 'icon.svg'), appIconSVG);
    await sharp(Buffer.from(appIconSVG))
      .png()
      .resize(1024, 1024)
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ Generated icon.png (1024x1024)');

    // Generate adaptive icon (108x108 for Android)
    const adaptiveIconSVG = generateSVG(108);
    fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), adaptiveIconSVG);
    await sharp(Buffer.from(adaptiveIconSVG))
      .png()
      .resize(108, 108)
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ Generated adaptive-icon.png (108x108)');

    // Generate favicon (32x32)
    const faviconSVG = generateSVG(32);
    fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSVG);
    await sharp(Buffer.from(faviconSVG))
      .png()
      .resize(32, 32)
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ Generated favicon.png (32x32)');

    // Generate splash icon (1242x2436 - iPhone X resolution)
    const splashIconSVG = generateSVG(1242);
    fs.writeFileSync(path.join(assetsDir, 'splash-icon.svg'), splashIconSVG);
    await sharp(Buffer.from(splashIconSVG))
      .png()
      .resize(1242, 2436)
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✅ Generated splash-icon.png (1242x2436)');

    console.log('\n🎉 All icons generated successfully!');
    console.log('📱 Your custom logo is now set as the app icon');
    console.log('🚀 Run: npx expo start --clear to see the changes');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons(); 