# scrybinwebsite

Marketing + support + privacy site for [Scrybin](https://scrybin.app), the iOS app
that tracks where every MTG card in your collection physically lives.

Plain static HTML/CSS — no build step. Deployed on Vercel (`vercel.json` enables
clean URLs: `/support`, `/privacy`).

- `index.html` — landing page
- `support.html` — FAQ + support contact (App Store "Support URL")
- `privacy.html` — privacy policy (App Store "Privacy Policy URL")
- `styles.css` — shared stylesheet; brand tokens mirror the app's `ChaosTheme.Brand`
- `assets/` — icon + screenshots exported from the app repo (`docs/brand/exports/`)

## TODO before App Store launch
- Replace the placeholder App Store link in `index.html` (search `TODO`) with the
  real URL once the Scrybin record is live.

## Local preview

```sh
python3 -m http.server 8080
```

(Clean URLs won't resolve locally — use `/support.html` — or run `vercel dev`.)
