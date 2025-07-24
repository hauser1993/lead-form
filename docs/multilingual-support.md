# Multilingual Support

## Overview

The OnboardingWizard component supports German and English languages with cookie-based persistence. Language selection is user-controlled (no auto-detection) and persists across browser sessions.

## Features

- **Language Toggle**: Two flag buttons (🇺🇸 English, 🇩🇪 German) in the navigation header
- **Cookie Persistence**: Language preference saved in `investor_language` cookie (365 days)
- **Translation System**: Basic translation structure for UI elements, navigation, and toast messages
- **No Auto-Detection**: Users must manually select their preferred language

## Implementation

### Language Management

```typescript
type Language = 'en' | 'de'

// Cookie utilities for persistence
const getCookieValue = (name: string): string | null
const setCookieValue = (name: string, value: string, days: number = 365)

// Translation hook
const useTranslation = (language: Language) => {
  const t = (key: string, fallback?: string): string => { ... }
  return { t }
}
```

### Component Integration

All step components receive language props:
- `language?: 'en' | 'de'` - Current selected language
- `t?: (key: string, fallback?: string) => string` - Translation function

### Translation Structure

Translations are organized by category:
- `nav.*` - Navigation elements (Previous, Next, Submit, etc.)
- `step.*` - Step titles and navigation
- `toast.*` - Success/error messages
- `time.*` - Time formatting
- `form.*` - Form labels and placeholders

## Usage

### Adding New Translations

1. Add entries to the `translations` object in `OnboardingWizard.tsx`
2. Use translation keys in components via the `t()` function
3. Provide fallback text for missing translations

Example:
```typescript
const translations: Translations = {
  'myFeature.title': { en: 'My Feature', de: 'Meine Funktion' },
  'myFeature.description': { en: 'Description', de: 'Beschreibung' }
}

// In component
<h1>{t('myFeature.title', 'Default Title')}</h1>
```

### Language Switching

Users can switch languages by clicking the flag buttons in the header. The selection is automatically saved to cookies and applied immediately to all translated elements.

## Current Translation Coverage

- Navigation buttons and status indicators
- Step titles in navigation
- Toast notifications (success/error messages)
- Time formatting (e.g., "Saved 5 minutes ago")
- Form title and basic UI elements

## Future Enhancements

- Step component content translation
- Form field labels and validation messages
- Error messages and help text
- Date/number formatting based on locale 