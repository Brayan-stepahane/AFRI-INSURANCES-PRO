# AFRI Insurance PRO

A React Native mobile application built with Expo and TypeScript.

## Project Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
├── components/             # Reusable React components
├── services/               # API services and external integrations
├── store/                  # Zustand state management
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── config/                 # Configuration files
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Afri-pro
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

### Running the App

- **Web**: `npm run web`
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Start Expo**: `npm start`

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router
- **State Management**: Zustand
- **UI Components**: React Native Paper
- **HTTP Client**: Axios
- **Storage**: AsyncStorage + Expo Secure Store
- **Animations**: React Native Reanimated

## Architecture

### Authentication Flow
- Login/Register screens in `(auth)` group
- Protected screens in `(app)` group
- Authentication state managed globally with Zustand
- Secure token storage with Expo Secure Store

### Services
- **authService**: Handles login, register, logout
- **storageService**: Manages AsyncStorage and Secure Store operations
- **apiClient**: Axios instance with auth interceptors

### Components
- **Common**: Reusable UI components (Button, Card, Header)
- **Auth**: Authentication-specific components
- **Dashboard**: Dashboard-specific components

## Development

### Type Safety
This project uses TypeScript for type safety. Make sure to:
- Define types in `src/types/`
- Use proper typing in components and services
- Avoid `any` types

### State Management
- Use Zustand for global state
- Create hooks in `src/hooks/` for custom logic
- Keep state shallow and organized

### Styling
- Use the theme config in `src/config/theme.ts`
- Maintain consistent spacing and colors
- Use `StyleSheet.create()` for performance

## Environment Variables

See `.env.example` for available variables:
- `EXPO_PUBLIC_API_URL`: Backend API endpoint
- `EXPO_PUBLIC_ENV`: Environment (development/staging/production)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - AFRI Insurance S.A.
