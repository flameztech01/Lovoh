export const config = {
  runtime: "edge",
};

const API_URL = process.env.VITE_API_URL?.replace(/\/$/, "");

export default async function handler(request) {
  const url = new URL(request.url);

  const ua = request.headers.get("user-agent") || "";

  const isBot =
    /facebookexternalhit|twitterbot|linkedinbot|whatsapp|googlebot|discordbot|slackbot|telegrambot|bingbot/i.test(
      ua
    );

  // HUMANS → React app
  if (!isBot) {
    return fetch(new URL("/", url.origin));
  }

  // DEFAULT META
  let meta = {
    title: "Biizzed - Discover & Connect",
    description:
      "Articles, magazines, and videos from creators worldwide.",
    image: `${url.origin}/default-og.jpg`,
    url: url.href,
  };

  try {
    // ARTICLES
    if (url.pathname.startsWith("/articles/")) {
      const slug = url.pathname.replace("/articles/", "");

      if (!slug.startsWith("edit-")) {
        const res = await fetch(
          `${API_URL}/api/articles/slug/${slug}`
        );

        if (res.ok) {
          const a = await res.json();

          meta.title = a.title;

          meta.description = (
            a.excerpt ||
            a.summary ||
            ""
          ).slice(0, 160);

          meta.image = abs(
            a.featuredImage || a.images?.[0],
            url.origin
          );
        }
      }
    }

    // VIDEOS
    else if (url.pathname.startsWith("/videos/")) {
      const id = url.pathname.replace("/videos/", "");

      if (!id.startsWith("edit-")) {
        const res = await fetch(
          `${API_URL}/api/videos/${id}`
        );

        if (res.ok) {
          const v = await res.json();

          meta.title = v.title;

          meta.description = (
            v.description || ""
          ).slice(0, 160);

          meta.image = abs(v.thumbnail, url.origin);
        }
      }
    }

    // USERS
    else if (url.pathname.startsWith("/user/")) {
      const id = url.pathname.replace("/user/", "");

      const res = await fetch(
        `${API_URL}/api/users/${id}`
      );

      if (res.ok) {
        const u = await res.json();

        meta.title = `${u.name || u.username} on Biizzed`;

        meta.description =
          `${u.bio || "Check out their profile on Biizzed"}`;

        meta.image = abs(u.profile, url.origin);
      }
    }
  } catch (err) {
    console.log(err);
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />

<title>${esc(meta.title)}</title>

<meta name="description" content="${esc(meta.description)}" />

<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:image" content="${esc(meta.image)}" />
<meta property="og:url" content="${esc(meta.url)}" />
<meta property="og:type" content="website" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${esc(meta.image)}" />

</head>

<body>
<h1>${esc(meta.title)}</h1>
<p>${esc(meta.description)}</p>
</body>
</html>
`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control":
        "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}

function abs(src, origin) {
  if (!src) return `${origin}/default-og.jpg`;

  if (src.startsWith("http")) return src;

  return `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}