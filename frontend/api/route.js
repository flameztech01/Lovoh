// api/route.js — runs on every request before static files
export default function handler(req, res) {
  const host = req.headers.host || '';
  
  const hostMap = {
    'biizzed.lovohcreate.com': '/biizzed.html',
    'www.biizzed.lovohcreate.com': '/biizzed.html',
    'uduua.lovohcreate.com': '/uduua.html',
    'www.uduua.lovohcreate.com': '/uduua.html',
    'eventroom.lovohcreate.com': '/eventroom.html',
    'www.eventroom.lovohcreate.com': '/eventroom.html',
    'lovohcreate.com': '/index.html',
    'www.lovohcreate.com': '/index.html',
  };
  
  const target = hostMap[host];
  
  if (target) {
    // Serve the correct HTML file
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).sendFile(target, { root: './dist' });
  }
  
  // Fallback — let Vercel serve static files normally
  res.status(404).send('Not found');
}

// Tell Vercel this handles all routes
export const config = {
  api: {
    bodyParser: false,
  },
};