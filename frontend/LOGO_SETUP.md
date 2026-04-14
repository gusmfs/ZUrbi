# zUrbi Logo & Favicon Setup

To add your custom logo and favicon to zUrbi, please add the following files to the `public/` folder:

## Required Files:

### Logo
- `zUrbi-logo.svg` - Main logo for header and hero section (recommended: 40px height, scalable SVG)
- `zUrbi-logo.png` - PNG fallback if needed (recommended: 200x60px)

### Favicon
- `zUrbi-favicon.svg` - Modern SVG favicon
- `zUrbi-favicon-32x32.png` - 32x32 PNG favicon
- `zUrbi-favicon-16x16.png` - 16x16 PNG favicon
- `zUrbi-apple-touch-icon.png` - 180x180 Apple touch icon

## Logo Specifications:

### Header Logo:
- Height: 40px (32px on mobile)
- Format: SVG preferred, PNG fallback
- Should work well on dark blue background

### Hero Logo:
- Height: 60px
- Format: SVG preferred
- Should work well on gradient background

## Color Guidelines:
- Primary: #003366 (dark blue)
- Secondary: #00AA44 (green)
- Background: White/light gray

## File Structure:
```
public/
├── zUrbi-logo.svg
├── zUrbi-favicon.svg
├── zUrbi-favicon-32x32.png
├── zUrbi-favicon-16x16.png
└── zUrbi-apple-touch-icon.png
```

Simply drop your logo and favicon files into the `public/` folder with these exact names, and they'll automatically be used throughout the application!