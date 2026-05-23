export const config = { runtime: 'edge' };

const API_URL = process.env.VITE_API_URL?.replace(/\/$/, '');

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Pass through any file request (let Vercel return 404 if file doesn't exist)
  const isFile = path.includes('.') && !path.endsWith('/');
  const isKnownPath = 
    path.startsWith('/assets/') ||
    path.startsWith('/static/') ||
    path === '/favicon.ico' ||
    path === '/manifest.json' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml';
  
  if (isFile || isKnownPath) {
    // Try to fetch the file, if 404 just return empty 404 instead of looping
    const fileRes = await fetch(request);
    if (fileRes.status === 404) {
      return new Response(null, { status: 404 });
    }
    return fileRes;
  }

  const ua = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|googlebot|discordbot|slackbot|telegrambot|bingbot/i.test(ua);

  // Humans: serve the React app
  if (!isBot) {
    const res = await fetch(new URL('/index.html', url.origin));
    if (!res.ok) {
      return new Response('Error loading app', { status: 500 });
    }
    const html = await res.text();
    return new Response(html, { 
      headers: { 
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate'
      } 
    });
  }

  // Bots: build meta tags
  let meta = {
    title: 'Biizzed - Discover & Connect',
    description: 'Articles, magazines, and videos from creators worldwide.',
    image: `${url.origin}/default-og.jpg`,
    url: url.href,
  };

  try {
    if (path.startsWith('/articles/')) {
      const slug = path.replace('/articles/', '');
      if (!slug.startsWith('edit-')) {
        const res = await fetch(`${API_URL}/api/articles/slug/${slug}`);
        if (res.ok) {
          const a = await res.json();
          meta.title = a.title;
          meta.description = (a.excerpt || a.summary || '').slice(0, 160);
          meta.image = abs(a.featuredImage || a.images?.[0], url.origin);
        }
      }
    }
    else if (path.startsWith('/videos/')) {
      const id = path.replace('/videos/', '');
      if (!id.startsWith('edit-')) {
        const res = await fetch(`${API_URL}/api/videos/${id}`);
        if (res.ok) {
          const v = await res.json();
          meta.title = v.title;
          meta.description = (v.description || '').slice(0, 160);
          meta.image = abs(v.thumbnail || v.youtubeThumbnail, url.origin);
        }
      }
    }
    else if (path.startsWith('/user/')) {
      const id = path.replace('/user/', '');
      const res = await fetch(`${API_URL}/api/users/${id}`);
      if (res.ok) {
        const u = await res.json();
        meta.title = `${u.name || u.username} on Biizzed`;
        meta.description = `${u.name || u.username} — ${u.bio || 'Check out their profile on Biizzed'}`;
        meta.image = abs(u.profile, url.origin);
      }
    }
  } catch (_) {}

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:image" content="${esc(meta.image)}">
<meta property="og:image:secure_url" content="${esc(meta.image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(meta.url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Biizzed">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${esc(meta.image)}">
</head>
<body>
<h1>${esc(meta.title)}</h1>
<p>${esc(meta.description)}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  });
}

function abs(src, origin) {
  if (!src) return `${origin}/default-og.jpg`;
  if (src.startsWith('http')) return src;
  return `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}