# Project Guidelines

## Feature-Sliced Design (FSD)

Architecture: `shared/` → `entities/` → `features/` → `widgets/` → `screens/` → `app/`

- Import only from lower layers; slices of the same layer don't import each other.
- Import through the slice's public API (`src/entities/application`), never its internals.
- Segments: `model/` (hooks), `api/`, `lib/` (utils, mutation registration, schemas), `ui/` (components).
- `shared/` has zero dependencies on upper layers.
- Run `yarn lint` — the FSD rules are enforced by ESLint.

## State

- Server state → TanStack Query only. Client state (session, connectivity, sync status, filters, UI) → Zustand.
- Never copy server data into Zustand.
- Mutation logic (request, optimistic update, cache sync) is registered with `setMutationDefaults`
  in `entities/*/lib/register*Mutations.ts`, so queued offline changes replay after a restart.
  Hooks only select a mutation by key. Every change carries `idempotencyKey` and `description`.
- Use `submitChange()` from `src/shared/lib` in forms: awaits online, queues offline.

## Code conventions

- TypeScript strict, no `any`. Comments in English.
- One component per file; hooks (`use*`) live in `model/`, never inside component files.
- Styling with NativeWind classes; colors come from `src/shared/const/palette.js` (Tailwind + TS).
- Components in FlatList `renderItem` are `memo`; callbacks passed as props use `useCallback`.
- Run `yarn typecheck`, `yarn lint`, `yarn test` and Prettier before finishing a change.
