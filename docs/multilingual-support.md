# Multilingual Support

## Overview

The OnboardingWizard component supports German and English languages with cookie-based persistence. Language selection is user-controlled (no auto-detection) and persists across browser sessions. **Full translation support is now implemented across all components.**

## Features

- **Language Dropdown**: Dropdown selector with flags (🇺🇸 English, 🇩🇪 German) in the navigation header
- **Cookie Persistence**: Language preference saved in `investor_language` cookie (365 days)
- **Translation System**: Comprehensive translation structure for all UI elements, forms, and content
- **No Auto-Detection**: Users must manually select their preferred language
- **Complete Coverage**: All step components are fully translated

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

Each component has a default fallback: `t = (key, fallback) => fallback || key`

### Translation Structure

Translations are organized by category:
- `nav.*` - Navigation elements (Previous, Next, Submit, etc.)
- `step.*` - Step titles and navigation
- `toast.*` - Success/error messages
- `time.*` - Time formatting
- `form.*` - Form labels and placeholders
- `welcome.*` - Welcome step content
- `personal.*` - Personal info step content
- `gender.*` - Gender options
- `nationality.*` - Nationality options
- `address.*` - Address step content
- `country.*` - Country options
- `assets.*` - Asset info step content
- `legal.*` - Legal step content
- `terms.*` - Terms of service content
- `privacy.*` - Privacy policy content
- `confirmation.*` - Confirmation step content

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

Users can switch languages using the dropdown selector in the header. The selection is automatically saved to cookies and applied immediately to all translated elements.

## Full Translation Coverage

### ✅ Completed Components

- **OnboardingWizard**: Navigation, status indicators, toast messages
- **WelcomeStep**: Welcome messages, features, notices, button text
- **PersonalInfoStep**: Form labels, placeholders, gender/nationality options, privacy notice
- **MoreInfoStep**: Address form labels, placeholders, country options, verification notice
- **AssetInfoStep**: Transaction forms, upload messages, file handling, notices
- **LegalStep**: Legal agreements, terms of service, privacy policy, marketing consent
- **ConfirmationStep**: Summary sections, status information, legal confirmations

### Translation Categories Implemented

1. **Navigation & UI**: Buttons, status indicators, connectivity messages
2. **Form Elements**: Labels, placeholders, validation messages, required field indicators
3. **Options Lists**: Gender, nationality, country selections with localized names
4. **Content Sections**: Step descriptions, notices, informational text
5. **Legal Content**: Terms of service, privacy policy text with full translations
6. **Status & Feedback**: Toast notifications, upload status, progress indicators
7. **Data Display**: Summary labels, confirmation details, transaction information

### Features

- **Consistent Formatting**: European number formatting (XXX.XXX,XX) for German locale
- **Currency Display**: Euro symbol (€) with localized number formatting
- **Fallback Handling**: Graceful degradation when translations are missing
- **Context-Aware**: Different translations for similar concepts in different contexts

## Technical Details

- **Performance**: Translation keys are resolved at render time with memoized translation function
- **Bundle Size**: All translations included in main bundle (no lazy loading needed for 2 languages)
- **Type Safety**: Translation keys are strings with TypeScript interface definitions
- **Browser Support**: Cookie-based persistence works across all modern browsers

## Future Enhancements

- Additional language support (French, Spanish, etc.)
- Date/time formatting based on locale
- RTL language support
- Translation management system integration
- Automatic translation key extraction tools 