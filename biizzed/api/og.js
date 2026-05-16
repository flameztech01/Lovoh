// api/og.js — Vercel Edge Function
export const config = { runtime: 'edge' };

// Known non-content routes to skip
const SKIP_PATHS = [
  'feed', 'login', 'signup', 'profile', 'followers', 'videos', 'magazines', 
  'articles', 'search', 'settings', 'notifications', 'create-video', 
  'create-article', 'create-magazine', 'feed/resubscribe', 'admin',
  'edit-article', 'edit-magazine', 'edit-video', 'user'
];

export default async function handler(request) {
  const url = new URL(request.url);
  
  // Skip static files and API
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/assets') ||
      /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|json)$/.test(url.pathname)) {
    return fetch(request);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|googlebot|discordbot|slackbot|telegrambot/i.test(userAgent);

  // Real users: serve the normal React app
  if (!isBot) {
    return fetch(request);
  }

  // Bots: fetch metadata and return HTML
  const apiUrl = process.env.VITE_API_URL?.replace(/\/$/, '');
  
  let meta = {
    title: 'Biizzed - Discover & Connect',
    description: 'Articles, magazines, and videos from creators worldwide.',
    image: `${url.origin}/default-og.jpg`,
    url: url.href,
  };

  try {
    // ARTICLES: /articles/:slug
    if (url.pathname.startsWith('/articles/')) {
      const slug = url.pathname.replace('/articles/', '');
      // Skip if it's an edit route
      if (!slug.startsWith('edit-')) {
        const res = await fetch(`${apiUrl}/api/articles/slug/${slug}`);
        if (res.ok) {
          const article = await res.json();
          meta.title = article.title;
          meta.description = (article.excerpt || article.summary || '').slice(0, 160);
          meta.image = article.featuredImage || article.images?.[0] || meta.image;
        }
      }
    } 
    // VIDEOS: /videos/:id
    else if (url.pathname.startsWith('/videos/')) {
      const id = url.pathname.replace('/videos/', '');
      if (!id.startsWith('edit-')) {
        const res = await fetch(`${apiUrl}/api/videos/${id}`);
        if (res.ok) {
          const video = await res.json();
          meta.title = video.title;
          meta.description = (video.description || '').slice(0, 160);
          meta.image = video.thumbnail || meta.image;
        }
      }
    }
    // USER PROFILE: /user/:userId
    else if (url.pathname.startsWith('/user/')) {
      const userId = url.pathname.replace('/user/', '');
      const res = await fetch(`${apiUrl}/api/users/${userId}`);
      if (res.ok) {
        const user = await res.json();
        meta.title = `${user.name || user.username} on Biizzed`;
        meta.description = `${user.name || user.username} - ${user.bio || 'Check out their profile on Biizzed'}`;
        meta.image = user.profile || meta.image;
      }
    }
    // MAGAZINES: /:slug (root level, but NOT known pages)
    else {
      const slug = url.pathname.slice(1); // remove leading /
      const firstSegment = slug.split('/')[0];
      
      // Only try magazine fetch if it's not a known route
      if (slug && !SKIP_PATHS.includes(firstSegment)) {
        const res = await fetch(`${apiUrl}/api/magazine/${slug}`);
        if (res.ok) {
          const magazine = await res.json();
          meta.title = magazine.title;
          meta.description = (magazine.summary || '').slice(0, 160);
          meta.image = magazine.coverImage || meta.image;
        }
      }
    }
  } catch (err) {
    console.error('OG error:', err);
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:image" content="${esc(meta.image)}">
  <meta property="og:url" content="${esc(meta.url)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Biizzed">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${esc(meta.image)}">
  <script>window.location.replace("${esc(meta.url)}");</script>
</head>
<body>
  <p>Loading ${esc(meta.title)}...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function esc(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}