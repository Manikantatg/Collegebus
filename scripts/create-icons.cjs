const fs = require('fs');
const https = require('https');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Download and convert image to required sizes
async function createIcons() {
  const imageUrl = 'https://www.kishkindauniversity.edu.in/images/logo-kis.png';
  
  try {
    // Download the image
    const imageBuffer = await downloadImage(imageUrl);
    
    // Create circular versions of the image
    const sizes = [192, 512];
    
    for (const size of sizes) {
      await createCircularIcon(imageBuffer, size);
    }
    
    console.log('Icons created successfully!');
  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function createCircularIcon(imageBuffer, size) {
  try {
    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Load image
    const img = await loadImage(imageBuffer);
    
    // Draw circular mask
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Draw image centered and scaled to fit
    const scale = Math.max(size / img.width, size / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    
    ctx.drawImage(img, x, y, width, height);
    
    // Save to file
    const fileName = `icon-${size}x${size}.png`;
    const filePath = path.join(__dirname, '..', 'public', 'icons', fileName);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Created ${fileName}`);
  } catch (error) {
    console.error(`Error creating ${size}x${size} icon:`, error);
  }
}

// Run the function
createIcons();