# Travel blog

Plain HTML pages for the Pablo & Luisa Garcia travel blog. There is no build step. GitHub Pages serves each folder’s `index.html` as a clean URL.

The blog is a tree:

```
continent  →  country  →  city  →  stories, photos, tours
```

| Page | URL |
| --- | --- |
| Blog index | `/blog/` |
| South America | `/blog/south-america/` |
| Argentina | `/blog/south-america/argentina/` |
| Puerto Iguazú (Iguazú Falls) | `/blog/south-america/argentina/puerto-iguazu/` |
| Brazil | `/blog/south-america/brazil/` |
| Balneário Camboriú | `/blog/south-america/brazil/balneario-camboriu/` |
| Rio de Janeiro | `/blog/south-america/brazil/rio-de-janeiro/` |
| Colombia (cities coming soon) | `/blog/south-america/colombia/` |

Styles for every blog page live in one file: [`blog.css`](blog.css). Copy a folder when you add a place. Do not add a new stylesheet.

`guides/santa-catarina/` is a separate sales page for a future digital product. Do not move it, link it, or fold it into this blog.

## Add a city

1. Copy an existing city folder, for example `south-america/brazil/rio-de-janeiro/`.
2. Rename the copy to a short lowercase slug with hyphens, such as `florianopolis`. Put it inside the right country folder.
3. Open the new `index.html` and update:
   - `<title>`, meta description, canonical URL, and Open Graph / Twitter tags (`TITLE` and `META` comments in the file).
   - The breadcrumb, the `<h1>`, and the line under the title.
   - The hero image and the photo grid. Keep `loading="lazy"` `decoding="async"` plus real `width` and `height`.
   - Tour links, or remove the tour cards if this city has none yet.
4. Delete the `<aside class="placeholder">` block and write a short introduction in your own words. The dashed box is a marker so a draft is not mistaken for a finished story. Do not publish it, and do not invent a visit.
5. On the **country** page (`south-america/brazil/index.html` and its siblings), add a card inside `.place-grid` that links to the new folder. Copy a card that is already there and change the href, image, title, and the “N tours” line.
6. If that country page still shows “Cities coming soon”, remove the `<div class="empty-state">` once the first city card exists.

The public URL is the folder path with a trailing slash, for example `/blog/south-america/brazil/florianopolis/`.

## Add a country

1. Copy `south-america/colombia/` (empty city list) or `south-america/argentina/` (one city) into `south-america/your-country/`.
2. Update the title, meta tags, breadcrumb, heading, and placeholder the same way as a city.
3. Add a card on `south-america/index.html`.
4. Add city folders inside the country, and add a card on the country page for each one. Until then, leave the “Cities coming soon” block.

## Add a continent

1. Copy the `south-america/` folder (you can start without its countries and add them after).
2. Update that continent’s `index.html`.
3. Add one card on [`/blog/index.html`](index.html). Only continents that have a page should appear there.

## Add a story on a city page

Stories live on the city page, in the Stories section. There is no separate post engine.

1. Open the city `index.html` and find `id="stories"`.
2. Remove the “No stories published yet” box when you publish the first one.
3. Paste one `<article class="story">` per post. A sample is in an HTML comment in that section, and here:

```html
<article class="story">
  <p class="story-date"><time datetime="2026-01-15">January 15, 2026</time></p>
  <h3>Title you actually want to publish</h3>
  <p>Your own account of the day. Delete any placeholder sentence before you publish.</p>
</article>
```

Write only what you did and what you want a reader to know. Tour descriptions already used on the home page can be reused on the matching city page.

To give a story its own URL later, copy the city folder pattern into a subfolder and link the title to it. Keep using `/blog/blog.css`.

## Images

Reference pictures that already live at the site root. Do not rename, move, or delete those files (another change is optimizing them in place). Example:

```html
<img
  src="/BalnearioCamboriu.png"
  alt="Beach and skyline in Balneário Camboriú"
  width="1665"
  height="945"
  loading="lazy"
  decoding="async"
>
```

Root files you can point at today:

| File | Used for |
| --- | --- |
| `BalnearioCamboriu.png` | Balneário Camboriú skyline and beach |
| `Pirate boat.png` | Cable car and pirate boat tour (space in the name: `/Pirate%20boat.png`) |
| `FoodTour.png` | Brazilian street food tour |
| `CableCar.png` | Private cable car, big wheel, and lunch tour |
| `NorthernBeaches.png` | Praia Brava and northern beaches tour |
| `Aquarium.png` | Aquarium and NASA experience tour |
| `Iguazu.png` | Iguazú Falls |
| `preview.jpg` | Fallback share image |

When an optimized WebP (or similar) replaces one of these, update the `src` and the width/height. Leave the old filename in the repo until that swap is done.

Rio de Janeiro has no root photo. The city page uses the same Unsplash image as the Rio card on the home page.

## Page chrome

Every blog page repeats the same navbar and footer so a copied folder still looks like the site. The navbar links YouTube, Music, Store, Travel, and Social back to the home page, and Blog back to `/blog/`. The Blog item uses `class="is-current"`.

Breadcrumbs start with Home, then Blog, then each level of the tree. The current page is text, not a link, with `aria-current="page"`.

Favicons match the home page and are linked from the site root (`/favicon-32x32.png` and the other sizes).

## Publishing checklist

- Folder name is the URL slug, and the page is `index.html` inside it.
- Title, description, canonical URL, and Open Graph image match this place.
- Breadcrumb trail is correct, including the parent links.
- The parent page has a card pointing here.
- The dashed placeholder box is gone, replaced by your own introduction.
- Internal links use root paths (`/blog/...`, `/Iguazu.png`) so they work from any folder.
- `guides/santa-catarina/` was not edited.
