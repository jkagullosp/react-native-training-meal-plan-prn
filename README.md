# KernelPRN

A modern, modular React Native app for meal planning, recipes, and nutrition tracking. The codebase follows a feature-first structure with a clear separation between API, service, and UI layers. It uses TypeScript, Zustand for client state, and React Query for server-state management.

---

## 🚀 Highlights

- Authentication (sign up, sign in, session persistence)
- Discover and search recipes with filters and tags
- Community recipe submission and admin workflow
- Meal planning, daily nutrition breakdown, and history
- Favorites and shopping list management
- Onboarding flow and profile management
- Push notifications and local notification channels
- Secure token storage integration (Keychain/Keystore adapter)

---

## 🗂 Project Structure (src)

Key folders and responsibilities:

```
src/
  api/            # Supabase query wrappers per feature (recipeApi, authApi, adminApi, etc.)
  client/         # Supabase client configuration (`src/client/supabase.ts`)
  components/     # Reusable UI components (cards, inputs, headers)
  constants/      # App-wide constants
  hooks/          # React Query hooks and custom hooks (useRecipesQuery, useAdminQuery...)
  navigation/     # Navigation stacks, tabs and screen registrations
  screens/        # Screen implementations (Discover, CreateRecipe, Admin screens...)
  services/       # Business logic layer (authService, recipeService, adminService...)
  stores/         # Zustand stores for ephemeral UI state (auth, onboarding)
  types/          # TypeScript definitions and DTOs
  utils/          # Helpers (image uploads, keychain adapter, notifications)
```

See the `src/` folder for full details — the code is organized by feature and responsibility.

---

## 🛠 Tech Stack

- React Native (React Native CLI)
- TypeScript
- Zustand (state management)
- TanStack Query / React Query (server-state caching)
- Supabase (database + auth)
- react-native-keychain (secure token storage adapter)
- Jest (testing)

---

## Quick Start

1. Clone and install:

```bash
git clone https://github.com/your-username/kernelprn.git
cd kernelprn
npm install
# or
yarn install
```

2. Environment variables

- Copy `.env.example` to `.env` and add your Supabase project values (URL and anon/service keys) and other env values used by the app.

3. iOS CocoaPods (macOS only):

```bash
npx pod-install
```

4. Run the app

```bash
npx react-native start
npx react-native run-ios   # or
npx react-native run-android
```

---

## 📜 Architecture Decision Records (ADR)

### ADR-001: State Management

- **Decision:** Use Zustand for client-side state management.
- **Reasoning:** Zustand provides a lightweight, flexible, and scalable solution for managing ephemeral UI state. It integrates well with React Query for server-state management.
- **Alternatives Considered:** Redux, Context API.

### ADR-002: API Layer

- **Decision:** Use Supabase for database and authentication.
- **Reasoning:** Supabase offers a scalable backend-as-a-service solution with built-in authentication and real-time capabilities. The API layer is implemented as lightweight wrappers for Supabase queries.
- **Alternatives Considered:** Firebase, custom Node.js backend.

### ADR-003: Secure Storage

- **Decision:** Use `react-native-keychain` for secure token storage.
- **Reasoning:** Ensures secure storage of authentication tokens in Keychain (iOS) and Keystore (Android).
- **Alternatives Considered:** AsyncStorage (less secure).

---

## 📘 API Documentation

### Example: `getAllUsers` API

**Description:** Fetches all non-admin user profiles from the database.

**Endpoint:** `supabase.from('profiles').select('*')`

**Code Example:**

```typescript
async getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}
```

**Response:**

```json
[
  {
    "id": "user-123",
    "name": "John Doe",
    "is_admin": false,
    "created_at": "2025-12-01T12:00:00Z"
  },
  {
    "id": "user-456",
    "name": "Jane Smith",
    "is_admin": false,
    "created_at": "2025-12-01T12:05:00Z"
  }
]
```

### Example: `banUser` API

**Description:** Bans a user by updating their profile status to `banned`.

**Endpoint:** `supabase.from('profiles').update({ status: 'banned' })`

**Code Example:**

```typescript
async banUser(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'banned' })
    .eq('id', userId);

  if (error) throw error;
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User banned successfully."
}
```

---

## Important Files / How This App Works

- `src/client/supabase.ts` — creates the Supabase client. The client is polyfilled for React Native and configured for session persistence.
- `src/utils/keychainAdapter.ts` — secure storage adapter using `react-native-keychain`. Supabase auth storage can be pointed to this adapter so access and refresh tokens are stored securely in Keychain/Keystore.
- `src/api/*.ts` — lightweight API wrappers that construct Supabase queries and return typed results.
- `src/services/*.ts` — perform higher-level logic (compose API calls, handle side-effects).
- `src/hooks/*.ts` — React Query hooks (including `useInfiniteQuery` for recipes) and other custom hooks used across screens.
- `src/screens/*.tsx` — screen implementations that use hooks and components.
- `src/components/RecipeCards.tsx` — recipe card UI used in lists (Discover, Admin grids).

If you add or change secure storage behavior, update `keychainAdapter.ts` and pass it into the Supabase client options.

---

## Admin vs Community Recipe Flow

- Community recipes use the “submit for approval” flow (created with `is_community: true`, `approved: false`, `author_id` set).
- Admin creation screens insert recipes with `is_community: false`, `author_id: null`, and `approved: true` so admin-created recipes appear immediately.

---

## Development Notes

- Infinite scroll: `useInfiniteQuery` is used for recipe lists with a `FlatList` and `onEndReached` to fetch next pages.
- Secure storage: use `react-native-keychain` for production to secure auth tokens; the repo includes a `keychainAdapter` under `src/utils/`.
- RLS / Supabase: the app uses row-level security; admin endpoints or policies may be required to access global stats (favorites/likes) from the client.

---

## Scripts

- `npm start` — start Metro bundler
- `npx react-native run-ios` / `run-android` — build & run on device or emulator
- `npm test` — run unit tests

---

## Testing

Unit and integration tests use Jest — run `npm test`. Add tests next to the code or in the `__tests__` folder.

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Implement your feature and add tests
4. Commit and open a pull request

Please follow the existing coding patterns (service + api + hooks) and add/update tests where possible.

---

## License

MIT — see `LICENSE`.

---

## Acknowledgements

- React Native
- Supabase
- Zustand
- TanStack Query

---
