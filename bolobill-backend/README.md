# BoloBill Backend (TypeScript)

Clean Express + TypeScript backend with controller/service/viewmodel architecture.

## Folder Structure

```text
src/
  app.ts
  server.ts
  config/
    env.ts
    database.ts
  common/
    ApiError.ts
    asyncHandler.ts
    jwt.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
  models/
    User.model.ts
    Invoice.model.ts
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.validation.ts
      auth.viewmodel.ts
    invoice/
      invoice.routes.ts
      invoice.controller.ts
      invoice.service.ts
      invoice.validation.ts
      invoice.viewmodel.ts
  services/
    whisper.service.ts
    transcriptParser.service.ts
    pdf.service.ts
```

## Setup

1. Create `.env` from `.env.example`
2. Add required values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
3. Run:

```bash
npm install
npm run dev
```

## Auth APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/auth/forgot/request-otp` (static OTP `123456`)
- `POST /api/auth/forgot/verify-otp`
- `POST /api/auth/forgot/reset-pin`

## Invoice APIs

- `POST /api/invoices/voice` (Bearer token, multipart `audio`, optional `language`)
- `POST /api/invoices/manual` (Bearer token)
- `GET /api/invoices` (Bearer token)
- `GET /api/invoices/latest/pdfs` (Bearer token)
- `GET /api/invoices/:id` (Bearer token)
- `GET /api/invoices/:id/preview` (Bearer token)
- `PUT /api/invoices/:id` (Bearer token)
- `DELETE /api/invoices/:id` (Bearer token)

## Static PDF URL

- `GET /api/files/pdfs/:fileName`

## Notes

- Voice transcription uses OpenAI Whisper (`whisper-1`).
- PDF files are generated in `storage/pdfs`.
- For backward compatibility with your app, `/api/invoice/*` is also mapped to invoice routes.

## Postman Ready Collection

Import these files in Postman:

- `postman/BoloBill-Backend.postman_collection.json`
- `postman/BoloBill-Backend.local.postman_environment.json`

The collection is preconfigured with:

- Dynamic `{{baseUrl}}`
- Auto token capture from register/login/verify OTP to `{{authToken}}`
- Auto `{{invoiceId}}` capture after create invoice calls
- Ready payloads for all auth and invoice APIs
- File upload field for Whisper voice API via `{{audioFilePath}}`
