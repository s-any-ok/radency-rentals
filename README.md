# Radency — Property Rental Management

Full-stack test task: an **ASP.NET Core Web API** (SQL Server, ASP.NET Identity) and a **React Native (Expo)** app for a property management company that accepts rental applications.

Two roles:

- **Applicant**: browses available units, fills out, submits, withdraws applications, and corrects and resubmits returned ones.
- **Property manager**: maintains properties and units, reviews submitted applications (Approve / Return / Deny). An approval issues a 12-month lease.

```
Radency/
├── backend/   ASP.NET Core 10 Web API + EF Core + Identity + xUnit tests
└── mobile/    Expo SDK 55 / React Native 0.83, TypeScript, Feature-Sliced Design
```

---

## Quick start

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| .NET SDK | 10.x (`dotnet --version`) | |
| Docker Desktop | any recent | Only runs **SQL Server**; the API itself runs with `dotnet run`. Not needed if you have a local SQL Server (see below) |
| Node.js / Yarn | Node 20+, Yarn 1.x | |
| Xcode (+ CocoaPods) / Android Studio | latest | The app uses an **Expo dev build** (native modules: MMKV, NetInfo, SecureStore), so **Expo Go won't work** |

On macOS, `backend/scripts/setup-mac.sh` installs the .NET SDK, `dotnet-ef` and Docker Desktop with Homebrew, starts SQL Server, builds the solution and runs the tests.

> Apple Silicon: SQL Server images are amd64-only. In Docker Desktop enable *Settings → General → "Use Rosetta for x86/amd64 emulation"*. If Homebrew says *"Cannot install under Rosetta 2"*, your terminal is running under Rosetta: run the command with `arch -arm64` or turn off *"Open using Rosetta"* for the terminal app.

### 1. Database (SQL Server)

```bash
cd backend
docker compose up -d          # SQL Server 2022 on localhost:1433 (sa / Radency_Str0ng!Pass)
```

The first start takes ~30–60 s (`docker logs -f radency-sqlserver` → *"SQL Server is now ready for client connections"*).

**Without Docker** (e.g. Windows with SQL Server Express / LocalDB), point `ConnectionStrings:Rentals` in `src/Radency.Rentals.Api/appsettings.json` to your server, e.g. (JSON-escaped):
`Server=(localdb)\\MSSQLLocalDB;Database=RadencyRentals;Trusted_Connection=True;TrustServerCertificate=True`.

### 2. Run the API

```bash
dotnet run --project src/Radency.Rentals.Api
```

No manual migration step: the EF Core migrations are committed (`src/Radency.Rentals.Infrastructure/Persistence/Migrations`) and on start the API creates the database, **applies migrations and seeds idempotently** (lookups, managers, applicants, properties, units, applications in every status).

- Swagger UI: **http://localhost:5080/swagger** (OpenAPI document at `/openapi/v1.json`). Call `POST /api/auth/login`, then **Authorize** with the returned `accessToken`.
- The API listens on `0.0.0.0:5080`, so emulators and phones on the same network can reach it.

**Reset the demo data** (drop the database; the next start recreates and reseeds it):

```bash
dotnet ef database drop --force \
  --project src/Radency.Rentals.Infrastructure --startup-project src/Radency.Rentals.Api
# or wipe the whole SQL Server container volume:
docker compose down -v && docker compose up -d
```

### 3. Tests

```bash
dotnet test                    # backend: domain rules + services on a real (SQLite in-memory) database
cd ../mobile && yarn test      # mobile: version chain, error mapping, form schemas
```

### 4. Mobile app

```bash
cd mobile
cp .env.example .env           # set EXPO_PUBLIC_API_URL (see below)
yarn install
yarn ios                       # or: yarn android — builds and installs the dev client, then starts Metro
```

Later runs only need Metro: `yarn start`, then press `i` / `a` (rebuild with `yarn ios` / `yarn android` only after native dependency changes).

`EXPO_PUBLIC_API_URL`:

- iOS simulator: `http://localhost:5080`
- Android emulator: `http://10.0.2.2:5080`
- Physical device: `http://<your-computer-LAN-IP>:5080`

The app allows plain HTTP for local development (`NSAllowsArbitraryLoads` / cleartext traffic in `app.config.ts`).

### Trying offline mode

Turn off the computer's network (Wi-Fi/Ethernet): the simulator/emulator follows it, while the API on `localhost` stays reachable. The app shows *"You're offline"*; make changes, restart the app, turn the network back on and watch the pending changes sync.

> **iOS Simulator quirk:** it reports going offline but often doesn't report the connection coming back. After reconnecting, reload the app (⌘R) — the queued changes are sent on start. Android emulators and real devices don't need this.

### Demo accounts

Password for all: **`Radency123`**

| Role | Email |
| --- | --- |
| Property manager | `manager@radency.test`, `manager2@radency.test` |
| Applicant | `applicant@radency.test`, `applicant2@radency.test`, `applicant3@radency.test`, `applicant4@radency.test` |

New users can sign up and choose their role.

---

## Backend

### Structure (clean architecture, dependencies point inwards)

```
src/
├── Radency.Rentals.Domain          Entities + business rules, no dependencies
│   ├── Applications/RentalApplication.cs   status state machine, section saves, review → lease
│   ├── Properties/Unit.cs                  inactive unit type rule
│   └── Leases/Lease.cs                     12-month term, "covers today"
├── Radency.Rentals.Application     Use cases (services), DTOs, FluentValidation rules
├── Radency.Rentals.Infrastructure  EF Core DbContext, configurations, migrations, Identity, Bogus seeder
└── Radency.Rentals.Api             Controllers, auth, policies, ProblemDetails, idempotency filter, OpenAPI
tests/
└── Radency.Rentals.UnitTests       xUnit: domain + services against SQLite in-memory
```

### API

| Method | Endpoint | Who |
| --- | --- | --- |
| POST | `/api/auth/register` · `/login` · `/refresh` · `/logout`, GET `/api/auth/me` | anyone / signed in |
| GET | `/api/properties`, `/api/properties/{id}` | signed in |
| POST/PUT/DELETE | `/api/properties[/{id}]`, POST `/api/properties/{id}/units`, PUT/DELETE `/api/units/{id}` | manager |
| GET | `/api/units/available`, `/api/unit-types` | signed in |
| GET | `/api/applications?status=&propertyId=&page=&pageSize=&sortBy=&sortDirection=` | own (applicant) / all (manager) |
| GET | `/api/applications/{id}` | owner / manager |
| POST | `/api/applications` (start), `/{id}/form` (Continue / Submit), `/{id}/withdraw` | applicant |
| POST | `/{id}/review`, GET `/{id}/history`, GET/PUT `/{id}/notes` | manager |

Errors are RFC 7807 ProblemDetails with a stable `code`: `400` validation (errors keyed by field path, e.g. `residences[0].moveOutDate`), `403`, `404`, `409 concurrency_conflict`, `422` business rule (e.g. `unit_has_active_lease`).

### Key design decisions

- **Authentication**: standard ASP.NET Identity user store + Identity **bearer token** handler (the same mechanism as `MapIdentityApi`, with refresh tokens). Sign-up adds a role choice. Logout updates the security stamp, which invalidates refresh tokens.
- **Authorization**: a fallback policy requires an authenticated user everywhere; `[Authorize(Policy = ...)]` role policies guard manager/applicant actions; services also check ownership (another applicant's application returns 404 so ids don't leak).
- **One form, one action**: `POST /api/applications/{id}/form` takes `{ command: Continue | Submit, section, applicantInfo | residences, version }`. *Continue* validates the posted section and persists it only when valid; *Submit* works only when both sections are saved. The DTO carries server-side decisions (`isEditable`, `canSubmit`, `canWithdraw`, `canReview`) and the UI renders each section editable or read-only from them; the controller/service reject posts that aren't allowed.
- **Status machine** lives in the domain: Draft → Submitted → Approved / Returned / Denied; Returned → Submitted; Draft / Submitted / Returned → Withdrawn. Approved, Denied, Withdrawn are terminal. Every transition is recorded (who, when, outcome, comment).
- **No second lease**: submit and approval reject the action when the unit has an active lease (other open applications are left alone). Approval also bumps the unit's concurrency version, so two managers approving different applications for the same unit at the same moment can't both succeed.
- **Unit types**: lookup with active/inactive values. A unit keeps displaying its inactive type, but an inactive type can't be selected for any other unit (enforced in the domain).
- **Optimistic concurrency**: every aggregate has a `Version` (GUID concurrency token regenerated on each save). Clients send the version they saw; a stale one → `409`. The original value is also pinned in EF, so a race between read and write is caught by the database update too.
- **Idempotency**: creates use **client-generated ids** (a replay returns the existing record), and every mutating request may carry an **`Idempotency-Key`**; the response is stored per user and replayed for duplicates. Deletes of something already gone succeed.
- **Database-side list**: filtering by status/property, sorting and paging all run in SQL (`IQueryable`), returning `{ items, total, page, pageSize }`.
- **Seeding**: Bogus with a fixed seed; every step checks what exists, so it's safe on each start.

---

## Mobile

### Architecture — Feature-Sliced Design

```
src/
├── app/        App.tsx, providers (persisted QueryClient, session), navigation, bootstrap
├── screens/    sign-in, sign-up, properties, property-details, available-units, applications, application, account
├── widgets/    property-list, property-units, available-units, application-grid,
│               application-wizard, application-overview, application-manager-panel, sync-status
├── features/   sign-in, sign-up, logout, property-editor, unit-editor, start-application,
│               application-form (section "partials"), withdraw-application, review-application,
│               application-filters, manager-notes, network-status, sync-errors
├── entities/   session (auth API + bearer/refresh interceptor), property (properties, units, unit types),
│               application (API, keys, schemas, offline mutations)
└── shared/     api (axios + ProblemDetails mapping), config (QueryClient, NetInfo, routes),
                lib (MMKV, secure storage, version chain, formatting), model (Zustand stores), ui (kit)
```

Layer imports and public APIs are enforced with ESLint (`import/no-restricted-paths`, `no-restricted-imports`).

- **TanStack Query** owns all server state (queries, mutations, optimistic updates, invalidation).
- **Zustand** holds client state only: session (tokens in memory, user profile), connectivity, sync status (pending count, rejected changes), list filters. No server data is copied into stores.
- **NativeWind (Tailwind)** for styling; colors come from one palette shared by Tailwind and TS.
- **Forms**: react-hook-form + zod, validated on the client; server field errors are mapped back onto the same fields.
- **Tokens** are stored in **expo-secure-store** (Keychain / Keystore) and attached to every request; a 401 triggers one shared refresh and a retry.

### Offline mode

- The query cache is **persisted to MMKV** and restored on start, so previously loaded data shows offline.
- **NetInfo → `onlineManager`**: offline, queries pause and mutations are **queued** (paused). Queued mutations are persisted too; their logic is registered with `setMutationDefaults`, so they **resume after reconnect, even after an app restart**. They run serially (one scope) to keep their order (e.g. create property → add unit).
- Optimistic updates show offline changes immediately (new drafts, saved sections, new units, ...).
- A banner shows **"You're offline"** and **how many changes are waiting to sync**.
- Every queued change carries an **Idempotency-Key** and creates use client ids, so replays can't create duplicates.
- Versions: queued edits carry the version the user saw. A small **version chain** rebases later queued edits of the same record onto the version produced by *our own* earlier change, while someone else's change is still detected as a conflict.
- When the server rejects a queued change (409 / 422 / 400), it's listed in a **"Not saved: …" banner** with the reason, and the cache is refetched.
- A signed-in user **stays signed in offline**: the session is only cleared on logout or when the server rejects the refresh token.

---

## Requirements coverage

- [x] React Native + TypeScript, functional components, hooks
- [x] TanStack Query for all server state, cache invalidation after mutations
- [x] Zustand for client state only
- [x] Client-side form validation
- [x] ASP.NET Core Web API, RESTful JSON, OpenAPI/Swagger
- [x] ASP.NET Identity users/roles, bearer tokens, `[Authorize]` + role policies
- [x] DB created + migrations applied on start; idempotent Bogus seed incl. applications in every status
- [x] Unit tests for business logic
- [x] Tokens in secure storage, bearer on every request
- [x] Offline: persisted data, queued + replayed changes, stays signed in, NetInfo + onlineManager, offline indicator + pending count
- [x] Optimistic concurrency, idempotent creates (client ids + Idempotency-Key), clear message for rejected queued changes
- [x] SQL Server, EF Core code-first migrations
- [x] Sign up (with role) / log in / log out
- [x] Properties & units CRUD through modals; unit type lookup with inactive rule enforced on the server
- [x] Application: two sections + summary, one view model, Continue / Back / Submit, residences via modal, server-decided read-only
- [x] Active lease checks at submit and approval
- [x] Review modal (Approve / Return / Deny, comment required for Return/Deny), status history for managers
- [x] Application list filtered by status and property in the database; applicants see their own

Bonus:

- [x] **1** — Paging and sorting in the database; reusable `DataGrid` component driven by the paged JSON endpoint (documented in OpenAPI)
- [x] **3** — Property manager notes (separate manager-only resource, never returned to applicants)
- [ ] 2 — Review queue (claim / release)
- [ ] 4 — Save invalid sections
- [ ] 5 — Multiple applicants per application
