const puppeteer = require('puppeteer-core');

async function waitForTween(page, maxMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const isTweening = await page.evaluate(() => window.__model.debug().tween);
    if (!isTweening) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 200));
}

async function testInteriors() {
  const browser = await puppeteer.launch({
    executablePath: '/home/vhm205/projects/personal/workspace/labs/demo/hemhome-3D/chrome/linux-155.0.8059.84/chrome-linux64/chrome',
    args: [
      '--headless=new',
      '--no-sandbox',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--window-size=1600,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Switch to Interior Tab
  await page.evaluate(() => {
    const tab = document.querySelector('[data-tab="interior"]');
    if (tab) tab.click();
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_cafe.png' });
  console.log('Saved view_int_cafe.png');

  // 2. View Central Atrium
  await page.evaluate(() => {
    const btn = document.querySelector('[data-view="atrium"]');
    if (btn) btn.click();
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_atrium.png' });
  console.log('Saved view_int_atrium.png');

  // 3. View Homestay Living Studio (Room 101/3rd Floor)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-view="studio"]');
    if (btn) btn.click();
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_studio.png' });
  console.log('Saved view_int_studio.png');

  // 4. View Inside the Alley (Streetview)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-view="street"]');
    if (btn) btn.click();
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_street.png' });
  console.log('Saved view_int_street.png');

  // 5. Test Golden Sunset inside the Studio Room
  await page.evaluate(() => {
    const studioBtn = document.querySelector('[data-view="studio"]');
    if (studioBtn) studioBtn.click();
    window.__model.setTimeOfDay('sunset');
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_studio_sunset.png' });
  console.log('Saved view_int_studio_sunset.png');

  // 6. Test Twilight Night inside the Cafe Lounge
  await page.evaluate(() => {
    const cafeBtn = document.querySelector('[data-view="cafe"]');
    if (cafeBtn) cafeBtn.click();
    window.__model.setTimeOfDay('night');
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_int_cafe_night.png' });
  console.log('Saved view_int_cafe_night.png');

  // 7. Switch back to Exterior Tab
  await page.evaluate(() => {
    window.__model.setTimeOfDay('noon');
    const extTab = document.querySelector('[data-tab="exterior"]');
    if (extTab) extTab.click();
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_ext_hero_check.png' });
  console.log('Saved view_ext_hero_check.png');

  console.log('Runtime errors logged:', errors);
  await browser.close();
}

testInteriors().catch(console.error);
