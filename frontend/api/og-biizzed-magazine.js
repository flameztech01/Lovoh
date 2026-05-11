// api/og-biizzed-magazine.js
export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const response = await fetch(`https://api.lovohcreate.com/api/magazines/${id}`);
    const magazine = await response.json();

    const imageUrl = magazine.coverImage || magazine.thumbnail || 'https://biizzed.lovohcreate.com/biizzed.png';
    const absoluteImage = imageUrl.startsWith('http') ? imageUrl : `https://biizzed.lovohcreate.com${imageUrl}`;

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${magazine.title} | Biizzed</title>
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Biizzed">
  <meta property="og:title" content="${magazine.title}">
  <meta property="og:description" content="${magazine.description?.slice(0,160)}">
  <meta property="og:image" content="${absoluteImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://biizzed.lovohcreate.com/magazines/${id}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${magazine.title}">
  <meta name="twitter:image" content="${absoluteImage}">
  <meta http-equiv="refresh" content="0;url=https://biizzed.lovohcreate.com/magazines/${id}">
</head>
<body></body>
</html>`);
  } catch (error) {
    res.status(500).send('Error');
  }
}