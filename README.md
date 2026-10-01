# AI Invoice

AI-powered invoice generation using Gemini with a strict **user-data-only** contract.

## Product Rules

The application is designed to generate invoices only from information explicitly provided by the user.

- Gemini extracts only facts explicitly supplied by the user.
- No RAG, client directory, product catalog, default prices, default tax rates, or invented customer/seller details.
- Missing or ambiguous invoice information is returned to the UI for clarification.
- Tax/GST must be explicitly supplied by the user, including an explicit **"no tax"** instruction when the user wants zero tax.
- Supports dynamic taxes such as GST, SGST, CGST, IGST, VAT, CESS, TDS/TCS, and custom tax labels/rates when explicitly provided.
- Multiple taxes can be applied where explicitly specified.
- A seller profile is optional.
- Users can skip the seller profile entirely.
- Multiple GST registrations can be stored in a seller profile.
- Invoice number and date can either be supplied by the user or explicitly allowed to be generated automatically.
- Subtotals, discounts, tax amounts, and totals are calculated deterministically by application code rather than by Gemini.
- Explicit discounts supplied by the user are applied; discounts are never invented.
- Currency is extracted from the user's input and is not restricted to a fixed currency list.

## Project Structure

```text
AI-Invoice/
├── app-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── .gitignore
└── README.md