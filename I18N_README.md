# Internationalization (i18n) in MarocBill

This project uses `react-i18next` to manage translations and language switching. This document explains how the internationalization system is implemented and how to use it in your components.

## Overview

The i18n setup includes:

- `i18next` as the core internationalization framework
- `react-i18next` for React integration
- `i18next-browser-languagedetector` for automatically detecting user language preferences
- `i18next-http-backend` for loading translations from separate files

## File Structure

```
├── public/
│   └── locales/          # Translation files
│       ├── fr/
│       │   └── translation.json
│       └── ar/
│           └── translation.json
└── src/
    ├── i18n/
    │   └── index.ts      # i18n configuration
    └── contexts/
        └── LanguageContext.tsx  # Context provider using i18next
```

## How to Use Translations in Components

### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  );
}
```

### With Variables

```jsx
import { useTranslation } from 'react-i18next';

function Greeting({ name }) {
  const { t } = useTranslation();
  
  return <p>{t('greeting.welcome', { name })}</p>;
}
```

In your translation file:
```json
{
  "greeting": {
    "welcome": "Welcome, {{name}}!"
  }
}
```

### Changing Language

```jsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <div>
      <button onClick={() => i18n.changeLanguage('fr')}>Français</button>
      <button onClick={() => i18n.changeLanguage('ar')}>العربية</button>
    </div>
  );
}
```

### Handling RTL Languages

The `LanguageContext` automatically sets the `dir` attribute on the HTML tag when switching languages.

You can also check the current direction in your components:

```jsx
import { useTranslation } from 'react-i18next';

function RTLAwareComponent() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div className={isRTL ? 'rtl-styles' : 'ltr-styles'}>
      {/* Component content */}
    </div>
  );
}
```

## Translation Keys Structure

We use a nested structure for translation keys to organize them by feature:

```
login.title
login.email
nav.dashboard
nav.clients
clients.add
clients.search
```

## Adding New Translations

1. Identify the key for your new text
2. Add the key and translation to `public/locales/fr/translation.json`
3. Add the Arabic translation to `public/locales/ar/translation.json`

## Formatting

For formatting dates, numbers, and currencies, we use custom utility functions:

- `formatDate`
- `formatCurrency`

## Namespaces

Currently, we use a single namespace ('translation'). If the application grows significantly, we can consider splitting translations into multiple namespaces (e.g., 'common', 'dashboard', 'invoices').

## Best Practices

1. Always use translation keys instead of hardcoded strings
2. Keep translation keys organized by feature or page
3. Use variables for dynamic content
4. Always provide translations for all supported languages
5. Test your UI in all languages, especially RTL languages 