# PWA Icons Guide

## Required Icons

The PWA manifest requires the following icon sizes. Place PNG files in the `/public` directory:

### Icon Sizes Needed

1. **icon-72.png** - 72x72px
2. **icon-96.png** - 96x96px
3. **icon-128.png** - 128x128px
4. **icon-144.png** - 144x144px
5. **icon-152.png** - 152x152px
6. **icon-192.png** - 192x192px
7. **icon-384.png** - 384x384px
8. **icon-512.png** - 512x512px
9. **badge-72.png** - 72x72px (for notifications)

### Screenshots (Optional but Recommended)

10. **screenshot-mobile.png** - 540x720px (mobile view)
11. **screenshot-desktop.png** - 1280x720px (desktop view)

## Design Guidelines

### Icon Design
- Use a simple, recognizable symbol
- Ensure good contrast for visibility
- Consider a clipboard or checklist icon for audit theme
- Use brand colors (blue #2563eb as primary)
- Make sure icon works at small sizes

### Color Scheme
- Primary: #2563eb (Blue)
- Secondary: #1d4ed8 (Darker Blue)
- Background: #ffffff (White)

### Creating Icons

You can use tools like:
- **Figma** - Design and export at multiple sizes
- **Adobe Illustrator** - Vector design with export
- **Canva** - Simple icon creation
- **Online Tools**:
  - https://realfavicongenerator.net/
  - https://www.favicon-generator.org/
  - https://favicon.io/

### Quick Setup

1. Create a 512x512px master icon
2. Use an online tool to generate all sizes
3. Place all files in `/public` directory
4. Test PWA installation

## Testing

After adding icons:

1. Open Chrome DevTools
2. Go to Application tab
3. Check Manifest section
4. Verify all icons load correctly
5. Test install prompt on mobile

## Current Status

⚠️ **Icons Not Yet Added** - Placeholder documentation created

To complete PWA setup:
1. Design or obtain icon images
2. Generate all required sizes
3. Place in `/public` directory
4. Test installation

## Temporary Solution

For development/testing, you can use a simple colored square:
- Create a 512x512px image with your brand color
- Add white text "ISO" or a simple icon
- Generate all sizes from this master

## Production Checklist

- [ ] Create master icon (512x512px)
- [ ] Generate all required sizes
- [ ] Add icons to `/public` directory
- [ ] Test on mobile device
- [ ] Verify install prompt appears
- [ ] Check icon displays correctly when installed
- [ ] Test on iOS and Android
- [ ] Verify notification badge icon
