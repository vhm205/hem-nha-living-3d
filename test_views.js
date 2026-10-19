const puppeteer = require('puppeteer-core');

async function waitForTween(page, maxMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const isTweening = await page.evaluate(() => window.__model.debug().tween);
    if (!isTweening) break;
    await new Promise(r => setTimeout(r, 100));
  }
  // extra settle frame
  await new Promise(r => setTimeout(r, 200));
}

async function captureViews() {
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

  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Hero View
  await page.screenshot({ path: 'view_hero.png' });
  console.log('Saved view_hero.png');

  // 2. Front View (Mặt đứng)
  await page.evaluate(() => window.__model.setView('front', document.querySelector('[data-view="front"]')));
  await waitForTween(page);
  await page.screenshot({ path: 'view_front.png' });
  console.log('Saved view_front.png');

  // 3. Top View (Mặt bằng)
  await page.evaluate(() => window.__model.setView('top', document.querySelector('[data-view="top"]')));
  await waitForTween(page);
  await page.screenshot({ path: 'view_top.png' });
  console.log('Saved view_top.png');

  // 4. Rooftop View (Sân thượng)
  await page.evaluate(() => window.__model.setView('rooftop', document.querySelector('[data-view="rooftop"]')));
  await waitForTween(page);
  await page.screenshot({ path: 'view_rooftop.png' });
  console.log('Saved view_rooftop.png');

  // 5. Entrance View (Cổng & Cafe)
  await page.evaluate(() => window.__model.setView('entrance', document.querySelector('[data-view="entrance"]')));
  await waitForTween(page);
  await page.screenshot({ path: 'view_entrance.png' });
  console.log('Saved view_entrance.png');

  // 6. Sunset (Hoàng Hôn)
  await page.evaluate(() => {
    window.__model.setView('hero', document.querySelector('[data-view="hero"]'));
    window.__model.setTimeOfDay('sunset');
  });
  await waitForTween(page);
  await page.screenshot({ path: 'view_sunset.png' });
  console.log('Saved view_sunset.png');

  // 7. Night (Đêm Sao)
  await page.evaluate(() => window.__model.setTimeOfDay('night'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'view_night.png' });
  console.log('Saved view_night.png');

  // 8. Clay Mode (Mô hình trắng)
  await page.evaluate(() => {
    window.__model.setTimeOfDay('noon');
    window.__model.toggleClay();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'view_clay.png' });
  console.log('Saved view_clay.png');

  await browser.close();
  console.log('All gallery screenshots saved successfully.');
}

captureViews().catch(console.error);
