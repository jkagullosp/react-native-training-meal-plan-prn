# KernelPRN

A modern, scalable React Native app for meal planning, recipes, and nutrition tracking. Built with best practices: feature-based structure, service/API layers, Zustand for state, and React Query for data fetching.

---

## 🚀 Features

- User authentication (sign up, sign in, password reset)
- Discover and search recipes
- Community recipe sharing
- Meal planning and daily nutrition
- Favorites and shopping list
- Onboarding flow
- Profile management
- Push notifications
- Modular, maintainable codebase

---

## 🗂️ Folder Structure

```
src/
  api/            # API service layers (Supabase, etc.)
  client/         # Supabase client setup
  components/     # Shared UI components
  constants/      # App-wide constants
  hooks/          # Custom React hooks (React Query, etc.)
  modules/        # Feature modules (auth, discover, meal-plan, etc.)
  navigation/     # Navigation configs (stacks, tabs)
  screens/        # Top-level screens
  services/       # Business logic, service layer
  stores/         # Zustand stores (global state)
  types/          # TypeScript types/interfaces
  utils/          # Utility functions/helpers
```

---

## 🛠️ Tech Stack

- React Native (Expo/CLI)
- TypeScript
- Zustand (state management)
- React Query (server state)
- Supabase (backend)
- Jest (testing)

---

## ⚙️ Setup & Installation

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-username/kernelprn.git
   cd kernelprn
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase keys, etc.
4. **Start the app:**
   ```sh
   npx react-native start
   npx react-native run-ios # or run-android
   ```

---

## 🧩 Usage

- **Authentication:** Sign up, sign in, and manage your profile.
- **Discover:** Browse and search recipes, filter by tags, ratings, etc.
- **Community:** Share your own recipes and view others'.
- **Meal Plan:** Plan your meals and track nutrition.
- **Favorites & Shopping List:** Save recipes and manage your shopping list.

---

## 🧪 Testing

Run tests with:

```sh
npm test
```

---

## 📦 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
