// setup-server.js — Aumage Worker Setup Wizard
// Run via Aumage-Setup.vbs — serves a local GUI on http://localhost:7842

const http   = require('http');
const { exec, spawn } = require('child_process');
const path   = require('path');
const os     = require('os');

const PORT = 7842;

// Store tokens in memory during session
let sessionEnv = {};

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Aumage Worker Setup</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 32px;
    min-height: 100vh;
  }
  h1 { font-size: 22px; color: #38bdf8; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #64748b; margin-bottom: 28px; }
  .card {
    background: #1e293b;
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 20px;
    border: 1px solid #334155;
  }
  .card h2 { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
  .btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s;
  }
  .btn:hover { opacity: 0.85; }
  .btn-primary { background: #3b82f6; color: white; }
  .btn-success { background: #22c55e; color: white; }
  .btn-warning { background: #f59e0b; color: white; }
  .btn-danger  { background: #ef4444; color: white; }
  .log {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 16px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #4ade80;
    min-height: 120px;
    max-height: 320px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin-top: 12px;
  }
  .step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .gap { margin-top: 12px; }
  .field-label { font-size: 12px; color: #94a3b8; display: block; margin-bottom: 4px; }
  .field-required { color: #ef4444; }
  .token-input {
    width: 100%;
    padding: 8px 12px;
    background: #0f172a;
    border: 1px solid #475569;
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 13px;
    font-family: monospace;
    margin-bottom: 12px;
  }
  .token-input:focus { outline: none; border-color: #38bdf8; }
  .token-saved { border-color: #22c55e !important; }
</style>
</head>
<body>
<h1>🚀 Aumage Worker Setup</h1>
<div class="subtitle">v4.1.0 — 2-Stage Card Factory with Browser Rendering</div>

<div class="card">
  <h2>Step 1 — Install Dependencies</h2>
  <p style="font-size:13px;color:#94a3b8;margin-bottom:12px">Installs @cloudflare/puppeteer and other packages.</p>
  <button class="btn btn-primary" onclick="runInstall()">Install npm Packages</button>
  <div class="log" id="installLog">Click Install to begin...</div>
</div>

<div class="card">
  <h2>Step 2 — Secrets</h2>
  <p style="font-size:13px;color:#94a3b8;margin-bottom:16px">Required before deploying. Values are used only during this session.</p>

  <label class="field-label">Cloudflare API Token <span class="field-required">*</span></label>
  <input id="cfToken" type="password" class="token-input" placeholder="Paste your Cloudflare API Token here">

  <label class="field-label">Signal Secret <span style="color:#64748b">(anti-tamper signing — make up any long random string)</span></label>
  <input id="signalSecret" type="password" class="token-input" placeholder="e.g. aumage-signal-secret-xk29fj83nq...">

  <button class="btn btn-primary" onclick="saveSecrets()">💾 Save Secrets</button>
  <span id="secretStatus" style="font-size:12px;color:#64748b;margin-left:12px"></span>
</div>

<div class="card">
  <h2>Step 3 — Deploy to Cloudflare</h2>
  <p style="font-size:13px;color:#94a3b8;margin-bottom:12px">Deploys the Worker to Cloudflare. Save secrets first.</p>
  <div class="step-grid">
    <button class="btn btn-success" onclick="runDeploy()">🚀 Deploy</button>
    <button class="btn btn-warning" onclick="runHealthCheck()">❤️ Health Check</button>
  </div>
  <div class="log" id="deployLog">Click Deploy to begin...</div>
</div>

<div class="card">
  <h2>Worker URL</h2>
  <p style="font-size:13px;color:#94a3b8">After deploy, your Worker will be live at:</p>
  <p style="font-family:monospace;color:#38bdf8;margin-top:8px;font-size:13px">
    https://aumage-pipeline.admin-it-e6e.workers.dev
  </p>
</div>

<script>
async function saveSecrets() {
  const token  = document.getElementById('cfToken').value.trim();
  const signal = document.getElementById('signalSecret').value.trim();
  const status = document.getElementById('secretStatus');

  if (!token) { status.textContent = '⚠️ Cloudflare API Token is required'; status.style.color = '#ef4444'; return; }

  const resp = await fetch('/secrets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ CLOUDFLARE_API_TOKEN: token, SIGNAL_SECRET: signal })
  });
  const data = await resp.json();
  if (data.ok) {
    status.textContent = '✓ Secrets saved for this session';
    status.style.color = '#22c55e';
    document.getElementById('cfToken').classList.add('token-saved');
    if (signal) document.getElementById('signalSecret').classList.add('token-saved');
  } else {
    status.textContent = 'Failed to save';
    status.style.color = '#ef4444';
  }
}

async function runInstall() {
  const log = document.getElementById('installLog');
  log.textContent = 'Installing...\\n';
  const resp = await fetch('/run?cmd=install');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    log.textContent += decoder.decode(value);
    log.scrollTop = log.scrollHeight;
  }
}

async function runDeploy() {
  const log = document.getElementById('deployLog');
  log.textContent = 'Deploying...\\n';
  const resp = await fetch('/run?cmd=deploy');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    log.textContent += decoder.decode(value);
    log.scrollTop = log.scrollHeight;
  }
}

async function runHealthCheck() {
  const log = document.getElementById('deployLog');
  log.textContent = 'Checking health...\\n';
  try {
    const resp = await fetch('https://aumage-pipeline.admin-it-e6e.workers.dev/health');
    const data = await resp.json();
    log.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    log.textContent = 'Health check failed: ' + e.message;
  }
}
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  // Save secrets to session memory
  if (url.pathname === '/secrets' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const secrets = JSON.parse(body);
        Object.assign(sessionEnv, secrets);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false }));
      }
    });
    return;
  }

  if (url.pathname === '/run') {
    const cmd = url.searchParams.get('cmd');
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    let command;
    const workerDir = __dirname;

    if (cmd === 'install') {
      command = 'npm install';
    } else if (cmd === 'deploy') {
      command = 'npx wrangler deploy';
    } else {
      res.end('Unknown command');
      return;
    }

    // Merge session secrets into environment
    const env = { ...process.env, FORCE_COLOR: '0', ...sessionEnv };

    const proc = spawn(command, {
      shell: true,
      cwd: workerDir,
      env,
    });

    proc.stdout.on('data', d => res.write(d.toString()));
    proc.stderr.on('data', d => res.write(d.toString()));
    proc.on('close', code => {
      res.write(`\n\nProcess exited with code ${code}\n`);
      res.end();
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Aumage Setup Wizard running at http://localhost:${PORT}`);
  exec(`start http://localhost:${PORT}`);
});

process.on('SIGINT', () => { server.close(); process.exit(0); });
