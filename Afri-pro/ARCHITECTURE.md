# 🏗️ Unified Design System Architecture

This document describes the unified design system integrated into AfriPro for consistent UI/UX across all screens.

## 📁 Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation sidebar (web)
│   │   ├── AppWrapper.tsx       # Top-level layout wrapper
│   │   ├── ModalWrapper.tsx     # Standard modal component
│   │   ├── PageWrapper.tsx      # Standard page layout
│   │   └── index.ts             # Exports
│   ├── common/                  # Shared UI components
│   ├── dashboard/               # Dashboard specific components
│   └── auth/                    # Auth components
├── config/
│   └── theme.ts                 # Color, spacing, typography tokens
├── design-system.ts             # Design tokens & constants
└── hooks/                       # Custom hooks

app/
├── (app)/
│   └── _layout.tsx              # App layout (sidebar + router on web)
└── (auth)/
    └── _layout.tsx              # Auth layout
```

## 🎨 Core Components

### 1. **Sidebar** (`src/components/layout/Sidebar.tsx`)
Navigation menu for web version with:
- Logo
- Menu items with icons
- User profile card
- Logout button

**Usage:**
```tsx
import { Sidebar } from '../../src/components/layout/Sidebar';

<Sidebar />
```

### 2. **PageWrapper** (`src/components/layout/PageWrapper.tsx`)
Standard page layout with header and content area.

**Features:**
- Page title & subtitle
- Action button
- Refresh control
- Consistent padding & spacing

**Usage:**
```tsx
import { PageWrapper } from '../../src/components/layout/PageWrapper';

<PageWrapper
  title="Prospections"
  subtitle="Suivi des prospects"
  actionButton={{
    label: '+ Nouvelle prospection',
    icon: '📋',
    onPress: () => handleNewProspection()
  }}
  onRefresh={() => handleRefresh()}
  refreshing={isRefreshing}
>
  {/* Your content */}
</PageWrapper>
```

### 3. **ModalWrapper** (`src/components/layout/ModalWrapper.tsx`)
Standard modal dialog for forms and popups.

**Features:**
- Backdrop dimming
- Consistent header with close button
- Scrollable content
- Centered layout

**Usage:**
```tsx
import { ModalWrapper } from '../../src/components/layout/ModalWrapper';

<ModalWrapper
  visible={visible}
  title="Nouvelle prospection"
  onClose={() => setVisible(false)}
  maxWidth={650}
>
  {/* Your form content */}
</ModalWrapper>
```

### 4. **AppWrapper** (`src/components/layout/AppWrapper.tsx`)
Top-level layout wrapper that manages sidebar on web vs mobile.

**Auto-handles:**
- Platform detection (web vs mobile)
- Sidebar visibility
- Content area layout

## 🎯 Design Tokens

All design tokens are centralized in **`src/design-system.ts`**:

```tsx
import DESIGN_SYSTEM from '../../src/design-system';

// Access tokens
DESIGN_SYSTEM.LAYOUT.SIDEBAR_WIDTH           // 240px
DESIGN_SYSTEM.COLOR_PALETTE.primary          // Violet dark
DESIGN_SYSTEM.SPACING_SCALE.xl               // 24px
DESIGN_SYSTEM.COMPONENT_STYLES.card          // Card styling
```

### Available Tokens

#### Layout
- `SIDEBAR_WIDTH` - 240px
- `CONTENT_MAX_WIDTH` - 1200px
- `MODAL_MAX_WIDTH` - 650px

#### Colors
- `primary` - Violet dark
- `secondary` - Orange
- `success`, `danger`, `warning`, `info`
- `neutral` - Gray scale

#### Spacing
- `xs: 4px`, `sm: 8px`, `md: 12px`, `lg: 16px`, `xl: 24px`, `xxxl: 32px`

#### Component Styles
- `.card` - Card default styling
- `.button.primary` - Primary button
- `.button.secondary` - Secondary button
- `.input` - Input field
- `.badge` - Badge styling
- `.modal` - Modal styling

## 🍱 Styling Best Practices

### 1. **Use Design System Colors**
```tsx
import { colors } from '../../src/config/theme';

<Text style={{ color: colors.violetDark }}>Text</Text>
```

### 2. **Use Design System Spacing**
```tsx
import { spacing } from '../../src/config/theme';

<View style={{ padding: spacing.xl, gap: spacing.md }} />
```

### 3. **Use Component Base Styles**
```tsx
import DESIGN_SYSTEM from '../../src/design-system';

<View style={DESIGN_SYSTEM.COMPONENT_STYLES.card}>
  {/* Content */}
</View>
```

### 4. **Consistent Modals**
Always use `ModalWrapper` for:
- Forms
- Dialogs
- Popups
- Confirmations

### 5. **Consistent Pages**
Always use `PageWrapper` for:
- Screen headers
- Action buttons
- Content areas
- Refresh controls

## 📱 Platform-Specific Handling

The architecture automatically handles web vs mobile:

**Web:** Shows sidebar + content
```
┌─────────────┬──────────────────────────┐
│   Sidebar   │       Content Area      │
│  (240px)    │    (Main content)       │
└─────────────┴──────────────────────────┘
```

**Mobile:** Full-width content
```
┌──────────────────────────┐
│      Content Area        │
│    (Full screen)         │
└──────────────────────────┘
```

## 🔄 Integration Steps

### For New Screens:

1. **Create screen component:**
```tsx
import { PageWrapper } from '../../src/components/layout/PageWrapper';

export default function MyScreen() {
  return (
    <PageWrapper
      title="My Screen"
      subtitle="Description"
      actionButton={{
        label: '+ New',
        onPress: () => { /* action */ }
      }}
    >
      {/* Your content */}
    </PageWrapper>
  );
}
```

2. **For modals/forms:**
```tsx
import { ModalWrapper } from '../../src/components/layout/ModalWrapper';

<ModalWrapper
  visible={visible}
  title="Form Title"
  onClose={() => setVisible(false)}
>
  {/* Your form */}
</ModalWrapper>
```

3. **Use consistent styling:**
```tsx
import DESIGN_SYSTEM from '../../src/design-system';
import { colors, spacing } from '../../src/config/theme';

<View style={[DESIGN_SYSTEM.COMPONENT_STYLES.card, { padding: spacing.xl }]}>
  {/* Content */}
</View>
```

## 📚 Component Examples

### Example: Prospections List Page
```tsx
import React from 'react';
import { View } from 'react-native';
import { PageWrapper } from '../../src/components/layout/PageWrapper';

export default function ProspectionsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleNewProspection = () => {
    // Navigate to new prospection form
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Refresh data
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <PageWrapper
      title="Prospections"
      subtitle="Suivi des prospects"
      actionButton={{
        label: '+ Nouvelle prospection',
        icon: '📋',
        onPress: handleNewProspection
      }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* List of prospections */}
    </PageWrapper>
  );
}
```

## ✅ Checklist for Consistency

- [ ] Using `PageWrapper` for screen headers
- [ ] Using `ModalWrapper` for forms/dialogs
- [ ] Using design system colors
- [ ] Using design system spacing
- [ ] Using component base styles
- [ ] Card styling from DESIGN_SYSTEM
- [ ] Buttons follow pattern
- [ ] Inputs use consistent styling
- [ ] Badges are styled correctly
- [ ] Responsive on web & mobile

## 🎓 Next Steps

1. Apply `PageWrapper` to all screens
2. Apply `ModalWrapper` to all modals
3. Update all components to use design system
4. Test on web and mobile
5. Ensure consistency across all screens
