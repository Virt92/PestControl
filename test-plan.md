# Test Plan: PestControl Initial Scaffold

## What Changed
Empty repo → full Vue 3 + Vite scaffold with admin panel layout, sidebar navigation, 6 views, and Tailwind styling.

## Primary Flow: Navigation and View Rendering

### Test 1: Dashboard loads correctly on root URL
- **Steps**: Open `http://localhost:5175/` in browser
- **Pass criteria**:
  - Sidebar visible on left with "🛡️ PestControl" branding and "Management Platform" subtitle
  - 6 navigation items visible: Дашборд, Клієнти, Об'єкти, Виїзди, Моніторинг, Документи
  - Header shows "Дашборд" as page title
  - 4 stat cards visible with labels: "Клієнти", "Об'єкти", "Активні виїзди", "Моніторингові точки" — all showing value "0"
  - "Останні виїзди" section with empty state message present

### Test 2: Navigation to each view works
- **Steps**: Click each sidebar link sequentially: Клієнти → Об'єкти → Виїзди → Моніторинг → Документи → Дашборд
- **Pass criteria for each view**:
  - **Клієнти**: Header shows "Клієнти", content has "Клієнти" heading + "Додати клієнта" button + placeholder text mentioning "B2B та B2C"
  - **Об'єкти**: Header shows "Об'єкти", content has "Об'єкти" heading + "Додати об'єкт" button + placeholder text
  - **Виїзди**: Header shows "Виїзди", content has "Виїзди" heading + "Запланувати виїзд" button
  - **Моніторинг**: Header shows "Моніторинг", content has "Моніторингові точки" heading + placeholder about QR/NFC
  - **Документи**: Header shows "Документи", content has "Документи" heading + placeholder about PDF
  - **Дашборд**: Returns to dashboard with 4 stat cards

### Test 3: Active route highlighting
- **Steps**: Navigate to Клієнти view
- **Pass criteria**: "Клієнти" sidebar item has green/brand highlight color; other items do not

### Test 4: Page title updates
- **Steps**: Navigate to Об'єкти view
- **Pass criteria**: Browser tab title reads "Об'єкти — PestControl"
