# Missing Translations

## Overview
This document lists translations that need to be added or corrected in the application. These are organized by language and feature area.

## French Translations

### Stock Management
- `navigation.stock`: Added, but ensure it matches `nav.stock` value
- `common.overview`: Already exists
- `common.coming_soon`: Already exists
- `common.cancel`: Already exists
- `common.error`: Already exists
- `common.no_company_selected`: Already exists
- `products.select_product`: Already exists
- `products.code`: Already exists

### Product Management
- All translations appear to be present

## Arabic Translations

### Navigation
- `navigation.stock`: Present but needs to match `nav.stock` value

### Product Management
- `products.select_category`: Should be translated to Arabic (currently in French)
- `products.unit`: Should be translated to Arabic (currently in French)
- `products.select_unit`: Should be translated to Arabic (currently in French)
- `products.units.piece`: Should be translated to Arabic (currently in French)
- `products.units.hour`: Should be translated to Arabic (currently in French)
- `products.units.day`: Should be translated to Arabic (currently in French)
- `products.units.kg`: Should be translated to Arabic (currently in French)
- `products.units.sqm`: Should be translated to Arabic (currently in French)
- `products.units.fixed`: Should be translated to Arabic (currently in French)
- `products.units.month`: Should be translated to Arabic (currently in French)
- `products.minQuantity`: Should be translated to Arabic (currently in French)
- `products.reference`: Should be translated to Arabic (currently in French)
- `products.reference_placeholder`: Should be translated to Arabic (currently in French)
- `products.barcode`: Should be translated to Arabic (currently in French)
- `products.barcode_placeholder`: Should be translated to Arabic (currently in French)
- `products.is_service`: Should be translated to Arabic (currently in French)
- `products.created_at`: Should be translated to Arabic (currently in French)
- `products.updated_at`: Should be translated to Arabic (currently in French)
- `products.all_categories`: Should be translated to Arabic (currently in French)
- `products.export.button`: Should be translated to Arabic (currently in French)
- `products.export.success`: Should be translated to Arabic (currently in French)
- `products.created`: Should be translated to Arabic (currently in French)
- `products.updated`: Should be translated to Arabic (currently in French)
- `products.deleted`: Should be translated to Arabic (currently in French)
- `products.duplicated`: Should be translated to Arabic (currently in French)
- `products.copy`: Should be translated to Arabic (currently in French)
- `products.add_category`: Should be translated to Arabic (currently in French)
- `products.category.add`: Should be translated to Arabic (currently in French)
- `products.category.edit`: Should be translated to Arabic (currently in French)
- `products.category.add_description`: Should be translated to Arabic (currently in French)
- `products.category.edit_description`: Should be translated to Arabic (currently in French)
- `products.category.name`: Should be translated to Arabic (currently in French)
- `products.category.description`: Should be translated to Arabic (currently in French)
- `products.category.created`: Should be translated to Arabic (currently in French)
- `products.category.updated`: Should be translated to Arabic (currently in French)

### Stock Management
- All translations appear to be present

## Issue with Duplicate Translations
There are linter errors in the `LanguageContext.tsx` file caused by duplicate translations. The problematic section starts around line 637:

```javascript
// Arabic translations
'common.overview': 'نظرة عامة',
'common.coming_soon': 'قريباً',
'common.cancel': 'إلغاء',
'common.error': 'خطأ',
'common.no_company_selected': 'لم يتم اختيار شركة',
'products.select_product': 'اختيار منتج',
'products.code': 'الرمز',
```

These keys already exist in the `ar` object, so this section should be removed to fix the linter errors. 