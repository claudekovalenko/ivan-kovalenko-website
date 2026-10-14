# Ivan Kovalenko — Ministry & Podcast website

A fast, single-page static site: no build step, no framework. Open `index.html` in a browser to preview.

## Make it yours: edit `config.js`

| Setting | What it does |
| --- | --- |
| `podcast.spotifyShowUrl` | **Paste your Spotify show link here.** In Spotify, open your show, then **Share → Copy link to show**. The embedded player and every "Listen on Spotify" button switch on automatically. |
| `podcast.applePodcastsUrl`, `podcast.youtubeUrl` | Extra listen buttons. Leave `""` to hide them. |
| `email` | Where the contact form sends messages (it opens the visitor's email app). |
| `social.*` | Instagram / YouTube / Facebook links. Empty ones are hidden. |
| `givingUrl` | A link to an online giving page. Setting it shows a "Support the ministry" box. |
| `name`, `tagline`, `heroVerse` | Headline text. |

**Your photo:** add a portrait named `assets/portrait.jpg` (portrait orientation, about 800×1000). It replaces the placeholder automatically.

The About, Ministry and Beliefs wording is in `index.html`. Search for the section and edit the text.

## Publishing (free)

- **GitHub Pages:** go to repo **Settings → Pages**, set Source to *Deploy from a branch*, and pick this branch with `/ (root)`.
- **Netlify / Cloudflare Pages / Vercel:** import the repo with no build command and `/` as the output directory.
