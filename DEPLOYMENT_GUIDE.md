# SlideWindr - Netlify Deployment Guide

This guide will help you deploy SlideWindr to Netlify in just a few minutes.

## Prerequisites

1. A [Netlify account](https://netlify.com) (free tier is perfect)
2. Your SlideWindr code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Netlify Dashboard (Recommended)

### Step 1: Push to Git Repository

If you haven't already, push your code to GitHub:

```bash
# Navigate to the project root
cd D:\App_Dev\SlideWinder

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Netlify deployment"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/slidewindr.git

# Push to GitHub
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your SlideWindr repository

### Step 3: Configure Build Settings

Netlify should auto-detect these settings from your `netlify.toml`, but verify:

- **Base directory**: `presenta-react` (or leave empty if deploying from root)
- **Build command**: `npm run build`
- **Publish directory**: `presenta-react/dist`
- **Node version**: 20 (set in netlify.toml)

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for the build to complete
3. Your site will be live at a URL like: `https://random-name-123456.netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Initialize Site

```bash
# Navigate to presenta-react directory
cd presenta-react

# Initialize Netlify site
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Enter site name (or use auto-generated)
- Build command: `npm run build`
- Directory to deploy: `dist`

### Step 4: Deploy

```bash
# Deploy to production
netlify deploy --prod
```

## Method 3: Drag & Drop Deploy

### Step 1: Build Locally

```bash
cd presenta-react
npm install
npm run build
```

### Step 2: Drag & Drop

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `presenta-react/dist` folder onto the page
3. Your site will be live instantly!

**Note**: This method is great for testing but doesn't support continuous deployment.

## Configuration Files

### netlify.toml

Your project includes a `netlify.toml` file with optimal settings:

- **SPA routing**: All routes redirect to index.html
- **Security headers**: XSS protection, frame options, etc.
- **Caching**: Aggressive caching for static assets
- **Node version**: Locked to Node 20

### Environment Variables

If you need environment variables:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Add variable"**
3. Add your variables (e.g., `VITE_API_KEY`)

**Important**: Vite requires env vars to start with `VITE_` to be exposed to the client.

## Continuous Deployment

Once connected to Git, Netlify automatically:

1. **Builds on every push** to your main branch
2. **Creates preview deploys** for pull requests
3. **Runs build checks** before deploying

### Branch Deploys

- `main` branch → Production site
- Other branches → Preview URLs (e.g., `branch-name--site-name.netlify.app`)

## Troubleshooting

### Build Fails

**Error**: "Command failed with exit code 1"

**Solutions**:
1. Check your `package.json` has all dependencies
2. Run `npm run build` locally to test
3. Check Netlify build logs for specific errors

### Site Shows 404

**Error**: Routes don't work after refresh

**Solution**: The `netlify.toml` includes SPA redirect rules. Make sure it's in the `presenta-react` directory.

### Large Bundle Size

**Warning**: "Your site is larger than recommended"

**Solutions**:
1. This is normal for Three.js apps
2. The gzip compression helps significantly
3. Consider code splitting for future optimization

### Memory Issues

**Error**: "JavaScript heap out of memory"

**Solution**: Add to netlify.toml:
```toml
[build.environment]
  NODE_OPTIONS = "--max-old-space-size=4096"
```

## Performance Optimization

### Enable Asset Optimization

In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - ✅ Bundle CSS
   - ✅ Minify CSS
   - ✅ Minify JavaScript
   - ✅ Pretty URLs

### Enable Netlify Analytics (Optional)

1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics ($9/month)
3. Get real-time visitor data without tracking cookies

## Custom Domain Setup

### Using Your Own Domain

1. Purchase a domain (Namecheap, Google Domains, etc.)
2. In Netlify: **Domain settings** → **Add custom domain**
3. Update your DNS records:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app

   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify's load balancer)
   ```

### Free HTTPS

Netlify automatically provides:
- ✅ Free SSL certificate (Let's Encrypt)
- ✅ Auto-renewal
- ✅ HTTP to HTTPS redirect

## Monitoring & Logs

### Build Logs

- View in dashboard: **Deploys** → Click on a deploy → **Deploy log**
- Real-time logs during build
- Download logs for debugging

### Function Logs (If Added Later)

- **Functions** → Select function → View logs
- Real-time streaming
- Error tracking

## Cost

**Free Tier Includes**:
- 100 GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment
- Instant rollbacks
- Preview deploys
- Custom domain

**Perfect for SlideWindr!** The free tier should handle thousands of users.

## Next Steps

1. ✅ Deploy using Method 1 (recommended)
2. ✅ Set up custom domain (optional)
3. ✅ Enable asset optimization
4. ✅ Share your live URL!

## Example Deployment Commands

```bash
# Full deployment workflow
cd D:\App_Dev\SlideWinder
git add .
git commit -m "Update: Added new features"
git push origin main
# Netlify automatically builds and deploys!

# Or use CLI for manual deploy
cd presenta-react
netlify deploy --prod
```

## Useful Links

- [Netlify Dashboard](https://app.netlify.com)
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Status](https://www.netlifystatus.com)
- [Netlify Support](https://www.netlify.com/support)

## Support

If you encounter issues:

1. Check [Netlify Docs](https://docs.netlify.com)
2. Review build logs in Netlify dashboard
3. Test build locally: `npm run build`
4. Contact Netlify support (free tier includes community support)

---

**Your SlideWindr site will be live at**: `https://your-site-name.netlify.app`

Enjoy your deployed presentation app! 🎉
