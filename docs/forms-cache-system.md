# Forms Cache System (Static Export Compatible)

## Overview
The forms cache system automatically fetches forms from the external API and stores them in a local JSON file. This cached data is then used for static generation, ensuring all form routes are pre-generated at build time for compatibility with Next.js static exports (`output: 'export'`).

## Static Export Constraints
⚠️ **Important**: This system is designed for `output: 'export'` which has the following limitations:
- All routes must be known at build time
- No dynamic route generation at runtime
- No server-side functionality in production

## Architecture

### Components
1. **Pre-build Script**: `scripts/prebuild-cache.js` - Fetches forms before build
2. **Cache Storage**: `public/cache/forms.json` - JSON file storing cached forms
3. **Cache API**: `/api/cache-forms` - Runtime API for cache updates (dev only)
4. **Auto-Update API**: `/api/auto-update-cache` - Runtime cache checking (dev only)
5. **Cache Utilities**: `src/lib/forms-cache.ts` - Helper functions for reading cache
6. **Cache Updater**: `src/components/CacheUpdater.tsx` - Client component for runtime updates
7. **Static Generation**: Modified `generateStaticParams()` to use cached forms

### Data Flow (Build Time)
```
Pre-build Script → External API → Cache JSON → Static Generation → All Routes Pre-generated
```

### Data Flow (Runtime - Development Only)
```
Client App → Auto-Update API → Cache API → External API → Update Cache JSON
```

## Files Structure

```
scripts/
  └── prebuild-cache.js         # Pre-build cache update script

public/cache/
  └── forms.json                # Cached forms data

src/app/api/
  ├── cache-forms/
  │   └── route.ts              # API to update cache (dev/manual only)
  └── auto-update-cache/
      └── route.ts              # API to check and trigger updates (dev only)

src/lib/
  └── forms-cache.ts            # Cache utilities and helper functions

src/components/
  └── CacheUpdater.tsx          # Client component for runtime updates (dev)

src/app/form/[slug]/
  └── page.tsx                  # Uses cached forms for static generation
```

## Build Process

### 1. Pre-build Cache Update
```bash
npm run prebuild  # Runs scripts/prebuild-cache.js
```

The prebuild script:
1. Fetches forms from external API
2. Creates/updates `public/cache/forms.json`
3. Ensures cache directory exists
4. Falls back to empty cache if API unavailable

### 2. Static Generation
```bash
npm run build  # Runs prebuild + next build
```

The build process:
1. `generateStaticParams()` reads the cache file
2. Attempts fresh API fetch as backup
3. Falls back to ultimate fallback slugs
4. Generates static pages for all discovered forms

## Cache File Format

```json
{
  "forms": [
    {
      "id": "1",
      "title": "Investment Application",
      "slug": "investment-application",
      "description": "Complete your investment application",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "lastUpdated": "2024-01-01T12:00:00Z",
  "updateInterval": 3600000
}
```

## Form Discovery Priority

### Build Time Priority:
1. **Pre-build cache** - From `prebuild-cache.js` 
2. **Fresh API fetch** - Direct API call during build
3. **Existing cache** - Previously cached forms
4. **Ultimate fallback** - Hardcoded essential slugs

### Ultimate Fallback Slugs:
- `varta-ag`
- `investment-application`
- `contact-form`
- `survey-form`
- `investor-onboarding`

## Runtime Updates (Development Only)

### Client-Side Updates
- `CacheUpdater` component runs on app load and every hour
- Only works in development mode
- Updates cache in background

### Manual Updates
```bash
# Update cache manually (development)
curl -X POST http://localhost:3000/api/cache-forms

# Check cache status
curl -X POST http://localhost:3000/api/auto-update-cache
```

## Production Deployment

### New Form Workflow:
1. **Add form** to external API
2. **Rebuild and redeploy** the static site
3. **Cache will be updated** during build process
4. **New form pages** will be statically generated

### Rebuilding for New Forms:
```bash
# Manual rebuild with fresh cache
npm run build

# Or just update cache for inspection
npm run prebuild
```

## Development vs Production

### Development
- Runtime cache updates enabled
- Automatic hourly updates
- API routes functional
- Full logging

### Production (Static Export)
- No runtime updates (no server)
- Cache updates only during build
- API routes not available
- Must rebuild for new forms

## Error Handling

### Pre-build Script Failures
- Creates empty cache if API unavailable
- Build continues with fallback slugs
- Never fails the build process

### Build-time API Failures
- Falls back to existing cache
- Falls back to ultimate fallback slugs
- Always generates some pages

### Missing Forms at Runtime
- Forms not in cache = 404 (no dynamic generation)
- Must rebuild to include new forms
- Client-side form fetching still works for content

## Benefits

### Performance
- ✅ All form pages pre-generated
- ✅ No runtime API dependencies
- ✅ Instant page loads
- ✅ CDN-friendly static files

### Reliability
- ✅ Works without external API at runtime
- ✅ Multiple fallback layers
- ✅ Build never fails due to API issues

### Maintainability
- ✅ Automatic form discovery during build
- ✅ No manual slug management
- ✅ Clear rebuild workflow for new forms

## Limitations

### Static Export Constraints
- ❌ No dynamic route generation at runtime
- ❌ New forms require full rebuild
- ❌ No server-side functionality in production

### Deployment Requirements
- 🔄 Must rebuild for new forms
- 🔄 Cache updates only during build
- 🔄 No automatic form discovery in production

## Monitoring

### Check Cache During Build
Build logs will show:
```
🚀 Pre-build cache update starting...
📡 Fetching forms from API: https://api.example.com/api/forms
✅ Successfully fetched 5 forms from API
📋 Cached 5 forms: [form-1, form-2, ...]
```

### Cache File Inspection
```bash
cat public/cache/forms.json
```

## Troubleshooting

### Forms Not Appearing (404)
1. **Check cache file**: Does `public/cache/forms.json` contain the form?
2. **Rebuild**: Run `npm run build` to regenerate with fresh cache
3. **API verification**: Ensure form exists in external API
4. **Manual cache**: Run `npm run prebuild` to update cache only

### Build Failures
1. **Check API URL**: Verify `NEXT_PUBLIC_API_URL` environment variable
2. **Network access**: Ensure build environment can reach external API
3. **Check logs**: Review prebuild script output for errors

### Cache Not Updating
1. **Run prebuild**: `npm run prebuild` manually
2. **Check API response**: Verify external API returns expected format
3. **File permissions**: Ensure write access to `public/cache/`

## Scripts Reference

```bash
# Update cache only (without building)
npm run prebuild

# Full build with cache update
npm run build

# Development with hot reloading
npm run dev
```

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-external-api.com
```

### Ultimate Fallback Slugs
Update in `src/lib/forms-cache.ts`:
```typescript
const ULTIMATE_FALLBACK_SLUGS = [
  'your-essential-form-slugs'
]
```

## Related Documentation
- [Static Parameters Generation](./static-params-generation.md)
- [Dynamic Routing](./dynamic-routing.md)
- [API Forms](./api-forms.md) 