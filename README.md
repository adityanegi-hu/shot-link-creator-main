# shot-link-creator v2

A **stateless** link shortener — no database storage of links. The destination URL is encoded directly into the shareable link using [lz-string](https://github.com/pieroxy/lz-string), inspired by [flems.io](https://flems.io). Only click analytics are persisted.

## How it works

```
User enters URL → /api/shorten validates it → frontend encodes with LZString
                                                      ↓
                        Shareable link: https://your-domain.com/go#<lz-encoded-url>
                                                      ↓
                        Recipient visits /go → client decodes hash → 5s countdown
                                                      ↓
                                    POST /api/analytics (best-effort) → redirect
```

- **No link storage** — the full destination URL lives in the URL hash, encoded with `LZString.compressToEncodedURIComponent`
- **Server is stateless** w.r.t. links — only analytics (click events) are stored in PostgreSQL
- **`/go#<hash>`** — the redirect page decodes, counts down 5 seconds, fires analytics, and redirects

---

## Quick start with Docker Compose

```bash
# Copy env example (edit if needed)
cp .env.example .env

# Start postgres + app
docker compose up
```

The app will be available at **http://localhost:3000**.

---

## Running locally (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally

```bash
# Install dependencies
npm install

# Set environment variables (copy and edit)
cp .env.example .env

# Start dev server (tsx watch)
npm run dev
```

---

## API

### `POST /api/shorten`
Validates a URL and returns the redirect base. The frontend appends `#<lz-encoded-url>` to form the shareable link.

**Request:**
```json
{ "url": "https://example.com/some/long/path" }
```

**Response:**
```json
{
  "url": "https://example.com/some/long/path",
  "redirectBase": "http://localhost:3000/go"
}
```

The shareable link is:
```
http://localhost:3000/go#<LZString.compressToEncodedURIComponent(url)>
```

---

### `POST /api/analytics`
Records a click event. Called automatically by the redirect page.

**Request:**
```json
{ "url": "https://example.com/some/long/path" }
```

**Response:** `204 No Content`

---

### `GET /api/analytics`
Returns click stats.

- **`GET /api/analytics`** — latest 100 clicks across all URLs
- **`GET /api/analytics?url=https://example.com/...`** — stats for a specific URL

**Response (by URL):**
```json
{
  "total": "42",
  "first_click": "2024-01-01T00:00:00Z",
  "last_click": "2024-06-15T12:34:56Z"
}
```

---

## The redirect page (`/go`)

Visit `/go#<lz-encoded-url>` in a browser. The page:
1. Decodes the hash with `LZString.decompressFromEncodedURIComponent`
2. Displays the destination URL
3. Fires `POST /api/analytics` (best-effort, non-blocking)
4. Counts down 5 seconds then redirects via `window.location.href`

If the hash is missing or corrupted, an error message is shown.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PG_USER` | `postgres` | PostgreSQL user |
| `PG_PASSWORD` | `postgres` | PostgreSQL password |
| `PG_DATABASE` | `analytics_db` | Database name |
| `PG_HOST` | `localhost` | PostgreSQL host |
| `PG_PORT` | `5432` | PostgreSQL port |
| `BASE_URL` | `http://localhost:3000` | Public base URL (used in `/api/shorten` response) |

---

## Project structure

```
.
├── src/
│   ├── index.ts            # Fastify server entry point
│   ├── config/
│   │   └── db.ts           # PostgreSQL pool + analytics table setup
│   └── routes/
│       ├── shorten.ts      # POST /api/shorten — URL validation
│       └── analytics.ts    # POST/GET /api/analytics — click tracking
├── public/
│   ├── index.html          # Frontend SPA
│   ├── go.html             # Client-side redirect page (lz-string decode + countdown)
│   └── assets/             # Pre-compiled frontend assets
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```
