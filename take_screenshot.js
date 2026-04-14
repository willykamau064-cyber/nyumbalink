const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set consistent viewport
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate to localhost
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });

  // Wait extra second for the 3D grid and assets to render
  await new Promise(r => setTimeout(r, 1000));

  // Click the auth-btn in navbar to open modal
  await page.click('#auth-btn');

  // Wait for the modal to transition in (0.3s approx)
  await new Promise(r => setTimeout(r, 600));

  // Take screenshot and save exactly to the artifacts directory
  const savePath = 'C:/Users/wilson/.gemini/antigravity/brain/59902c60-8587-4282-86d6-fee673e23273/live_login_modal.png';
  await page.screenshot({ path: savePath });

  console.log('Screenshot saved to:', savePath);
  await browser.close();
})();
