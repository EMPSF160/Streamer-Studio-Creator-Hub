# Build and Deployment Guide

## Cache-Busting Build Process

This project includes a cache-busting build script that automatically:
1. Generates MD5 hashes for all asset files (JS, CSS, images)
2. Renames files with hash pattern: `name.hash.ext`
3. Updates all HTML references to use the new hashed filenames

### Running the Build

```bash
# Install Node.js (if not already installed)
# Then run:
node build-cache-bust.js

# Or using npm script:
npm run build
```

### What Gets Processed

- **Directories**: `assets/`
- **File Types**: `.js`, `.css`, `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`
- **HTML Files**: All HTML files in the root directory

### Example Output

```
🚀 Starting cache-busting build...

📁 Processing assets...
  ✓ shared.js → shared.a1b2c3d4.js
  ✓ common.css → common.e5f6g7h8.css
  ✓ logo.png → logo.i9j0k1l2.png

📝 Updating HTML references...
  ✓ Updated index.html
  ✓ Updated about.html
  ...

✅ Build complete! Processed 3 assets.
```

### Hash Pattern

Files are renamed following this pattern:
```
original-name.hash.ext
```

Where:
- `hash` is an 8-character MD5 hash (first 8 characters)
- Example: `shared.js` → `shared.a1b2c3d4.js`

### Regex Pattern

The server configuration recognizes hashed files using:
```
^[\w-]+\.[0-9a-f]{8}\.(js|css|png|jpg|jpeg|svg|webp)$
```

## Deployment Checklist

- [ ] Run build script: `node build-cache-bust.js`
- [ ] Upload all files to your server
- [ ] Configure server headers (see SERVER_CONFIG.md)
- [ ] Test that assets load correctly
- [ ] Verify cache headers are working (check browser DevTools)

## Manual Cache-Busting

If you prefer to manually rename files:

1. Generate hash: Use MD5 hash of file content (first 8 characters)
2. Rename file: `filename.hash.ext`
3. Update HTML: Replace all references to the old filename

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: node build-cache-bust.js
      - name: Deploy
        # Add your deployment step here
```

