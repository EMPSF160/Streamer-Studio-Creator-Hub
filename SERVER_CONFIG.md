# Server Configuration Guide

## Quick Start

Configuration files have been created for different hosting platforms:

- **Apache**: `.htaccess` - Ready to use, just upload to your server
- **Nginx**: `nginx.conf` - Add to your server block configuration
- **Netlify**: `_headers` - Place in your site root or public folder
- **Vercel**: `vercel.json` - Already configured, just deploy

## HTTP Headers Configuration

Apply these headers to all HTML responses:

```
X-Content-Type-Options: nosniff
Content-Security-Policy: frame-ancestors 'self'
Content-Type: text/html; charset=utf-8
```

**DO NOT include these headers:**
- X-XSS-Protection
- X-Frame-Options
- Expires

### Implementation Examples

#### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set Content-Security-Policy "frame-ancestors 'self'"
    Header always set Content-Type "text/html; charset=utf-8"
</IfModule>
```

#### Nginx
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header Content-Security-Policy "frame-ancestors 'self'" always;
add_header Content-Type "text/html; charset=utf-8" always;
```

#### Node.js/Express
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});
```

## Caching Rules

### HTML Pages
```
Cache-Control: no-cache, must-revalidate, max-age=0
```

### Static Fingerprinted Assets (JS, CSS, Images)
```
Cache-Control: public, max-age=31536000, immutable
```

### Implementation Examples

#### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    # HTML files - no cache
    <FilesMatch "\.(html|htm)$">
        Header set Cache-Control "no-cache, must-revalidate, max-age=0"
    </FilesMatch>
    
    # Fingerprinted assets - long cache
    <FilesMatch "^[\w-]+\.[0-9a-f]{8}\.(js|css|png|jpg|jpeg|svg|webp)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>
```

#### Nginx
```nginx
# HTML files - no cache
location ~* \.(html|htm)$ {
    add_header Cache-Control "no-cache, must-revalidate, max-age=0" always;
}

# Fingerprinted assets - long cache
location ~* ^[\w-]+\.[0-9a-f]{8}\.(js|css|png|jpg|jpeg|svg|webp)$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

## Cache-Busting Pattern

Use hashed filenames following this pattern:
```
name.hash.ext
```

**Regex Pattern:**
```
^[\w-]+\.[0-9a-f]{8}\.(js|css|png|jpg|jpeg|svg|webp)$
```

### Example Filenames
- `shared.a1b2c3d4.js`
- `common.e5f6g7h8.css`
- `logo.i9j0k1l2.png`

### Build Process Integration

This requires a build tool to:
1. Generate hash for each asset file
2. Rename files with hash
3. Update HTML references to use hashed filenames

**Example with Webpack:**
```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    assetModuleFilename: '[name].[contenthash:8][ext]'
  }
};
```

**Example with Vite:**
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    }
  }
};
```

