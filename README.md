# AI Invoice

AI-powered invoice generation using Gemini with a strict user-data-only contract.

## Product rules

- Gemini extracts only facts explicitly supplied by the user.
- No RAG, client directory, product catalog, default prices, default tax rates, or invented customer/seller details.
- Missing or ambiguous invoice information is returned to the UI for clarification.
- Tax/GST must be explicitly supplied by the user, including an explicit "no tax" instruction for zero tax.
- A seller profile is optional. Users can skip it and can store multiple GST registrations in one profile.
- Invoice number/date can either be supplied by the user or explicitly allowed to be generated automatically.
- Subtotals, discounts, tax, and totals are calculated deterministically by application code.

## Structure

- `app-frontend/` — React + TypeScript + Vite frontend.
- `server/` — Express + TypeScript backend and Gemini extraction service.

## Environment

Create `server/.env` locally:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

Never commit `.env` or API keys.

## Run

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd app-frontend
npm install
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:5000`.

## Validation

Backend TypeScript:

```bash
cd server
npm run build
```

Frontend type checking and linting:

```bash
cd app-frontend
npx tsc -b
npm run lint
```
