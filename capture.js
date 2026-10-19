const puppeteer = require('puppeteer-core');

async function capture() {
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

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
    }
  });

  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'render_screenshot.png' });
  console.log('Screenshot saved to render_screenshot.png');

  await browser.close();
}

capture().catch(console.error);
