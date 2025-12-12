import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
let cachedRelease = null;
let cachedAt = 0;
const cacheDuration = 5 * 60 * 1000;

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function getLatestRelease() {
  const now = Date.now();
  if (cachedRelease && now - cachedAt < cacheDuration) return cachedRelease;
  try {
    const response = await fetch('https://api.github.com/repos/soymods/pathmind/releases/latest', {
      headers: {
        'User-Agent': 'soymods-site',
        Accept: 'application/vnd.github+json',
      },
    });
    if (!response.ok) throw new Error('GitHub request failed');
    const json = await response.json();
    const jarAsset = (json.assets || []).find((asset) => asset.name && asset.name.endsWith('.jar'));
    const release = {
      version: json.tag_name?.replace(/^v/, '') || '1.0.0',
      html_url: json.html_url,
      jar_url: jarAsset?.browser_download_url || null,
    };
    cachedRelease = release;
    cachedAt = now;
    return release;
  } catch (err) {
    return {
      version: '1.0.0',
      html_url: 'https://github.com/soymods/pathmind/releases/tag/v1.0.0',
      jar_url: null,
    };
  }
}

async function serveStatic(req, res, pathname) {
  const filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return serveStatic(req, res, path.join(pathname, 'index.html'));
    }
    const stream = createReadStream(filePath);
    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

const server = createServer(async (req, res) => {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  if (urlObj.pathname === '/api/releases/pathmind') {
    const data = await getLatestRelease();
    return sendJson(res, 200, data);
  }
  const pathname = urlObj.pathname.replace(/\/$/, urlObj.pathname === '/' ? '/' : '');
  return serveStatic(req, res, pathname);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Soymods site running on http://localhost:${port}`);
});
