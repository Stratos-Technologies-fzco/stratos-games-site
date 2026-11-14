// Tiny Chrome DevTools driver used by the browser checks (headless Chrome, no extra packages). Needs Node 22+ and Chrome.
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';   // set CHROME to your Chrome/Chromium path on another computer
async function launch(w, h, mobile) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cq-chrome-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--mute-audio', '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch (e) {} await new Promise(r => setTimeout(r, 200)); }
  const t = targets.find(x => x.type === 'page');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {}; const logs = []; const errors = []; const requests = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    else if (m.method === 'Runtime.consoleAPICalled') { const txt = m.params.args.map(a => a.value ?? a.description).join(' '); logs.push(m.params.type + ': ' + txt); if (m.params.type === 'error') errors.push(txt); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push('EXCEPTION ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const page = {
    logs, errors, requests, send,
    async goto(url) { await send('Page.navigate', { url }); await new Promise(r => setTimeout(r, 1200)); },
    async eval(expr) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails)); return r.result.result.value; },
    async shot(file) { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(file, Buffer.from(r.result.data, 'base64')); },
    async click(x, y) { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 }); await new Promise(r => setTimeout(r, 120)); },
    async drag(x1, y1, x2, y2) { await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', buttons: 1, clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: (x1 + x2) / 2, y: (y1 + y2) / 2, buttons: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x2, y: y2, buttons: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left' }); },
    sleep: ms => new Promise(r => setTimeout(r, ms)),
    async close() { try { await send('Browser.close'); } catch (e) {} try { proc.kill(); } catch (e) {} }
  };
  return page;
}
module.exports = { launch };
if (require.main === module) {
  const script = require(path.resolve(process.argv[2]));
  (async () => { const page = await launch(script.w || 420, script.h || 800, script.mobile); try { await script.run(page); } catch (e) { console.log('SCRIPT ERROR', e.message); } console.log('CONSOLE ERRORS:', JSON.stringify(page.errors)); await page.close(); process.exit(0); })();
}
