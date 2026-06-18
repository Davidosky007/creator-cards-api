# Creator Cards API

A REST API microservice that lets creators publish shareable profile cards showcasing their links and service rates.

Built with Node.js, Express, and MongoDB as part of the Resilience 17 Backend Engineer Assessment.

---

## Live API

**Base URL:** `https://creator-cards-api-3oiy.onrender.com`

> Note: The app is hosted on Render's free tier and may take 30–60 seconds to respond after a period of inactivity (cold start).

---

## Endpoints

### POST /creator-cards
Creates a new creator card.

**Request body:**
```json
{
  "title": "George Cooks",
  "description": "Weekly cooking podcast",
  "slug": "george-cooks",
  "creator_reference": "crt_8f2k1m9x4p7w3q5z",
  "links": [
    { "title": "YouTube", "url": "https://youtube.com/@georgecooks" }
  ],
  "service_rates": {
    "currency": "NGN",
    "rates": [
      { "name": "IG Story Post", "description": "One story mention", "amount": 5000000 }
    ]
  },
  "status": "published",
  "access_type": "public"
}
```

### GET /creator-cards/:slug
Retrieves a published card by its slug. Private cards require `?access_code=XXXXXX`.

### DELETE /creator-cards/:slug
Soft-deletes a card. Requires `creator_reference` in the request body.

---

## Custom Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `SL02` | 400 | Slug is already taken |
| `AC01` | 400 | access_code required when access_type is private |
| `AC05` | 400 | access_code cannot be set on public cards |
| `NF01` | 404 | Card not found (or deleted) |
| `NF02` | 404 | Card exists but is a draft |
| `AC03` | 403 | Private card — access code required |
| `AC04` | 403 | Invalid access code |

---

## Project Structure
