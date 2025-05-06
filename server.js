/**
 * server.js
 * Custom Next.js server for AWS Amplify SSR deployment
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Determine the environment
const dev = process.env.NODE_ENV !== 'production';
// Use the PORT environment variable provided by Amplify, or default to 3000
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error occurred during server initialization:', err);
  process.exit(1);
});