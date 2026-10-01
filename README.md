# AI Invoice

An AI-powered invoice generator that turns natural-language input into structured invoices using Gemini.

The main idea is simple: **the AI extracts what the user says, while the application handles the actual invoice logic and calculations.**

## What it does

You can describe an invoice naturally, for example:

> Create an invoice for ABC Ltd with 3 website designs at ₹12,500 each with 5% GST. Payment is due in 30 days.

The application extracts the relevant information, validates it, calculates the invoice values, and generates a structured invoice that can be edited and printed.

The goal is to keep AI responsible for **understanding the input**, not for making up invoice data or performing financial calculations.

---

## How it works

```mermaid
flowchart TD
    A[User enters invoice details] --> B[React Frontend]

    B --> C[POST /api/invoice/generate]

    C --> D[Express Backend]

    D --> E[Gemini Extraction Service]

    E --> F[Structured Invoice Data]

    F --> G[Validation]

    G --> H{Missing or ambiguous data?}

    H -- Yes --> I[Return clarification to UI]
    I --> A

    H -- No --> J[Deterministic Calculations]

    J --> K[Subtotal]
    J --> L[Discount]
    J --> M[Tax / GST]
    J --> N[Grand Total]

    K --> O[Invoice State]
    L --> O
    M --> O
    N --> O

    O --> P[Invoice Preview]

    P --> Q[Edit / Add-ons]
    P --> R[Print / PDF]