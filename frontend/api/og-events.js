// api/og-event.js
export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    // Fetch event from your backend API
    const response = await fetch(`https://api.lovohcreate.com/api/events/${id}`);
    const event = await response.json();

    if (!event) {
      return res.status(404).send('Event not found');
    }

    const imageUrl = event.images?.[0] 
      ? (event.images[0].startsWith('http') ? event.images[0] : `https://eventroom.lovohcreate.com${event.images[0]}`)
      : 'https://eventroom.lovohcreate.com/logo.png';

    const description = event.description 
      ? event.description.replace(/<[^>]*>/g, '').slice(0, 160)
      : 'Check out this event on EventRoom';

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${event.title} | EventRoom</title>
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EventRoom">
  <meta property="og:title" content="${event.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${event.title}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:url" content="https://eventroom.lovohcreate.com/events/${id}">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${event.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect to actual app -->
  <meta http-equiv="refresh" content="0;url=https://eventroom.lovohcreate.com/events/${id}">
  
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
    img { max-width: 100%; border-radius: 12px; margin-bottom: 20px; }
    h1 { color: #1B3766; margin-bottom: 10px; }
    p { color: #666; line-height: 1.6; }
    a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #1B3766; color: white; text-decoration: none; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${event.title}">
    <h1>${event.title}</h1>
    <p>${description}</p>
    <a href="https://eventroom.lovohcreate.com/events/${id}">View Event</a>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error('OG Event Error:', error);
    res.status(500).send('Error generating preview');
  }
}