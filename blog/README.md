# Travel blog

Static pages for the Pablo & Luisa travel blog. There is no build step. GitHub Pages serves each folder’s `index.html` as a clean URL.

The home page links here from the main navigation (`/blog/`). Pages are public, so do not add a robots `noindex` tag.

The blog is separate from the Santa Catarina sales page in `guides/santa-catarina/`. Do not move, edit, or merge that guide into the blog.

Visual design lives in one file, [`blog.css`](blog.css). Those rules match the home page (`index.html`): the same CSS variables, system / SF Pro stack, dark translucent navbar, section labels, buttons, destination cards, tour cards, and footer. Add a place by copying a folder and reusing those classes. Do not invent a second stylesheet.

## Analytics

Every HTML page under `/blog/` includes the same snippet in `<head>`, immediately after the viewport tag. Copy it with the page. Do not add a second Google tag, and do not add this snippet to `guides/santa-catarina/`.

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
</script>
<script src="/analytics.js" defer></script>
```

`/analytics.js` is the only analytics file. It sets Google Consent Mode v2 (`analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`) to `denied`, shows the cookie banner, and loads measurement ID `G-3NC3C9DM0S`. Accept stores `granted` in `localStorage` under `plg-consent` and calls `gtag('consent', 'update', ...)`. Decline stores `denied` and leaves those signals denied. The banner is created by the script, so a new page does not need banner markup.

Two events apply to blog pages, and both fire without extra code:

- `blog_tour_click` fires for a link whose text starts with `Check our tours in `. The `destination` parameter is the place name in that sentence.
- `converter_use` fires from [`converter.js`](converter.js), 800ms after the visitor changes the amount, the currency, or the swap direction. `from` and `to` are the ISO currency codes. The first paint does not count.

The same script also tracks the home page. New blog pages do not need markup for these:

- `generate_lead` is the Mailchimp subscribe form submit. It has no custom parameters.
- `tour_click` is a GetYourGuide, Viator, or TripAdvisor link. Parameters are `destination`, `platform` (`getyourguide`, `viator`, `tripadvisor`), and `tour_name`.
- `shop_click` is a link to `rockisland.pabloyluisagarcia.com`. It has no custom parameters.
- `social_click` is a YouTube, Spotify, YouTube Music, Instagram, or TikTok link. The `platform` parameter is `youtube`, `spotify`, `youtube_music`, `instagram`, or `tiktok`.

Booking links can set `data-tour-destination`, `data-tour-platform`, and `data-tour-name` on the anchor. If those attributes are missing, the script reads the destination panel title, the card heading, and the link host. Cross-domain linking is configured for `pabloyluisagarcia.com` and `rockisland.pabloyluisagarcia.com`.

## Map

```
blog/
  index.html                         /blog/
  south-america/
    index.html                       /blog/south-america/
    brazil/
      index.html                     /blog/south-america/brazil/
      balneario-camboriu/index.html  …/brazil/balneario-camboriu/
      rio-de-janeiro/index.html
    argentina/
      index.html
      puerto-iguazu/index.html       Puerto Iguazú / Iguazú Falls
    colombia/
      index.html                     Bogotá, Villa de Leyva, Santa Marta, Cartagena, Barranquilla
  north-america/
    index.html                       /blog/north-america/
    antigua-and-barbuda/index.html
    bahamas/index.html
    barbados/index.html
    belize/index.html
    canada/index.html
    costa-rica/index.html
    cuba/index.html
    dominica/index.html
    dominican-republic/index.html
    el-salvador/index.html
    grenada/index.html
    guatemala/index.html
    haiti/index.html
    honduras/index.html
    jamaica/index.html
    mexico/index.html
    nicaragua/index.html
    panama/index.html
    saint-kitts-and-nevis/index.html
    saint-lucia/index.html
    saint-vincent-and-the-grenadines/index.html
    trinidad-and-tobago/index.html
    united-states/index.html
```

Hierarchy is continent, then country, then city. City pages hold the photos, tour links, and (later) posts.

## Add a city

1. Copy an existing city folder. `rio-de-janeiro/` is the short template. `balneario-camboriu/` shows several tours.
2. Rename the folder with a lowercase slug: `buenos-aires`. The URL is the folder path.
3. In the new `index.html`, replace the title, meta description, canonical URL, Open Graph URL, breadcrumb labels and links, hero text, and placeholder name. Leave the analytics snippet that sits after the viewport tag.
4. On the parent country page, add one card inside `.destination-grid`:

```html
<a class="destination-card" href="/blog/south-america/argentina/buenos-aires/">
  <img src="/images/iguazu-1683.webp" srcset="/images/iguazu-640.webp 640w, /images/iguazu-1200.webp 1200w, /images/iguazu-1683.webp 1683w" sizes="(max-width: 768px) 100vw, 320px" alt="Iguazú Falls" width="1683" height="935" loading="lazy" decoding="async">
  <span class="dest-tag">Argentina</span>
  <div class="destination-card-overlay">
    <h3>Buenos Aires</h3>
    <span>1 tour</span>
  </div>
</a>
```

5. If this is the first or second city, add `cols-1` or `cols-2` on the grid. Three or more cities use the plain `destination-grid` (three columns, same as the home page).

## Add a country

1. Copy `blog/south-america/colombia/` (empty city list) or `blog/south-america/argentina/` (one city).
2. Put it in the right continent folder: `blog/south-america/peru/index.html`.
3. Update the title, description, canonical URL, breadcrumbs, heading, and placeholder.
4. Add a card on the continent page (`blog/south-america/index.html`) that links to the new country.
5. Until a city folder exists, leave a “Cities coming soon” card. That card uses `destination-card destination-card-plain destination-card-static` and is not a link.

A city with no photo yet uses `destination-card destination-card-plain` on the country page (no `<img>`) and `dest-panel-hero dest-panel-hero-placeholder` on the city page. Do not drop in a stock photo and present it as yours. Mark the introduction with the placeholder label.

## Add a continent

1. Copy `blog/south-america/` to `blog/europe/` (or start from `colombia/` if the continent should not list countries yet).
2. Update breadcrumbs so the trail is Blog → Europe.
3. Add one card on `blog/index.html` only when the continent has a real page. Do not add empty continents.

## Photos and posts

Tours stay on the home page. Do not add booking cards or GetYourGuide, Viator, or TripAdvisor buttons to a city page. If that city already has a tour panel, put one inline link in the introduction paragraph. The home page opens the panel from the hash:

- Balneário Camboriú → `/#camboriu`
- Rio de Janeiro → `/#rio`
- Iguazú → `/#iguazu`

Example: `<a href="/#camboriu">Check our tours in Balneário Camboriú</a>`. Cities without a home-page panel get no tour link.

The Journal block at the bottom is where posts go. Replace the “No stories published yet” card with a `.channel-card` per story. Do not publish the placeholder.

Extra photos can be another `.destination-card` in a `.destination-grid`.

## Copy you still have to write

The published introductions and the Travel tips lists are the owner’s copy. Keep the inline tour links (`/#camboriu`, `/#rio`, `/#iguazu`) when you edit those paragraphs. Do not invent a personal travel story to fill a gap.

## Images

Photos are the resized WebP files in `/images/`, the same ones the home page uses. The original root PNGs are gone. Point `src` at the largest variant and list every width in `srcset`, with a root-absolute path so the tag works in any folder.

Cards and tour photos use the home page size hint. Full-bleed heroes use `sizes="100vw"`.

```html
<img src="/images/balneario-1665.webp"
     srcset="/images/balneario-640.webp 640w, /images/balneario-1200.webp 1200w, /images/balneario-1665.webp 1665w"
     sizes="(max-width: 768px) 100vw, 320px"
     alt="Balneário Camboriú"
     width="1665" height="945"
     loading="lazy" decoding="async">
```

`width` and `height` stay the original pixel size (the same numbers as on the home page) so the ratio is right even when the file served is smaller. Rio de Janeiro still uses the Unsplash photo already on the home page, because there is no local file for it.

| Place | Files |
| --- | --- |
| Balneário Camboriú | `images/balneario-640.webp`, `balneario-1200.webp`, `balneario-1665.webp` |
| Iguazú | `images/iguazu-640.webp`, `iguazu-1200.webp`, `iguazu-1683.webp` |
| Pirate boat | `images/pirate-boat-640.webp`, `pirate-boat-1100.webp`, `pirate-boat-1600.webp` |
| Food tour | `images/food-tour-640.webp`, `food-tour-1100.webp`, `food-tour-1600.webp` |
| Cable car | `images/cable-car-640.webp`, `cable-car-1100.webp`, `cable-car-1600.webp` |
| Northern beaches | `images/northern-beaches-640.webp`, `northern-beaches-1100.webp`, `northern-beaches-1506.webp` |
| Aquarium | `images/aquarium-640.webp`, `aquarium-1100.webp`, `aquarium-1496.webp` |

## Navbar and footer

Copy the `<nav class="navbar">` and `<footer>` from a blog page when you create a new one. Section links point at the home page (`/#travel`, `/#music`, and the rest). The Blog link stays `aria-current="page"`. The small menu script at the bottom of the page is part of the copy; it only appears under 840px so the same six links still fit.

Favicons in `<head>` are the same files as the home page (`/favicon-32x32.png`, `/apple-touch-icon.png`, and the rest). Give every page its own `<title>`, meta description, canonical URL, and Open Graph tags. Keep the analytics snippet from the [Analytics](#analytics) section in `<head>`.
