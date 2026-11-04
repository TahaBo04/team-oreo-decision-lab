# Team Oreo Decision Lab

Static GitHub Pages edition of the Team Oreo Biscuit Factory Challenge dashboard.

The dashboard, decisions, production calculations, Monte Carlo optimizer, financial register, imports, exports and numerical copilot run in the browser. Scenarios are stored in this browser's local storage. The selected navigation is white and the Mondelez-inspired purple/orange/white theme and Team Oreo logo are retained.

## Publish

1. Create a public repository named `team-oreo-decision-lab` on your GitHub account.
2. Push these files to its `main` branch.
3. Under **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
4. The included workflow tests the model, builds the static website, then deploys the `dist` artifact. Use **Actions → Deploy Team Oreo to GitHub Pages → Run workflow** if the first run happened before Pages was enabled.

The build automatically uses the repository name as the URL base. Fonts, document links and downloaded source work under a project subdirectory.

## Local development

Node 24 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm dev
pnpm build
```

Set `PAGES_BASE_PATH=/` when deploying to a custom domain or a hosting root.

## OpenAI

GitHub Pages serves static files and cannot run the original server API. The numerical copilot needs no key. Its connection panel links to the existing hosted edition for optional OpenAI questions:

https://bimo-decision-lab.icyolive17.chatgpt.site

Export and import a scenario to transfer it between the two origins. No API key is requested, stored or embedded in this Pages edition.

## Financial model

Line/series changes are included in fixed costs and are never charged twice. Recorded T1 net profit is 181 kEUR; recorded T2 cash is 2,270 kEUR. Recorded financials and calculated forecasts stay distinct. The historical reconciliation gap is reported rather than replaced with a fabricated balancing item. See `docs/MODEL.md` for the rules, assumptions and numerical checks.

This is an independent educational tool for Team Oreo, not an official Mondelez application.
