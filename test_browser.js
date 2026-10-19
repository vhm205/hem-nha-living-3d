const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chromePath = '/home/vhm205/projects/personal/workspace/labs/demo/hemhome-3D/chrome/linux-155.0.8059.84/chrome-linux64/chrome';
  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--remote-debugging-port=9222',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--window-size=1600,900',
    'http://localhost:8080'
  ]);

  // wait 1 sec for chrome to start debugging
  await new Promise(r => setTimeout(r, 1200));

  // Connect to Chrome DevTools Protocol
  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const targets = JSON.parse(data);
        console.log('Targets:', targets.map(t => ({ title: t.title, url: t.url })));
      } catch (e) {
        console.error(e);
      }
      proc.kill();
    });
  }).on('error', (err) => {
    console.error('Error connecting to chrome:', err);
    proc.kill();
  });
}
main();
