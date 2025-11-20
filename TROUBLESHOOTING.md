# Troubleshooting Guide

## Issue: Blank Screen After Opening Repository

### Solution 1: Restart Dev Server (Most Common)
The dev server may have cached old files. Stop and restart it:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Solution 2: Clear Node Modules Cache
```bash
# Remove node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Solution 3: Clear Browser Cache
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Local Storage and Session Storage
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Solution 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Share the error message for debugging

## Issue: "Cannot find module" Errors

These are usually TypeScript cache issues and don't affect runtime. They should disappear after:
- Restarting the dev server
- Waiting a few seconds for TypeScript to recompile

## Issue: API Rate Limit Exceeded

GitHub allows 60 requests/hour without authentication.

**Solution:**
- Wait an hour before trying again
- Or use a different GitHub username

## Issue: Repository Not Found

**Possible causes:**
- Username doesn't exist
- Repository is private
- Repository was deleted

**Solution:**
- Double-check the username
- Try a public repository
- Try a popular username like "torvalds" or "gvanrossum"

## Issue: No Commits Showing

**Possible causes:**
- Repository is empty
- Repository has no commits
- API didn't return data

**Solution:**
- Try a different repository
- Check if the repository has commits on GitHub

## Debug Steps

1. **Check Network Tab**
   - Open DevTools → Network tab
   - Look for failed API requests
   - Check response status codes

2. **Check Console Errors**
   - Open DevTools → Console tab
   - Look for red error messages
   - Note the exact error text

3. **Verify API Calls**
   - Network tab should show requests to `api.github.com`
   - Status should be 200 (success)
   - Response should contain data

## Common Error Messages

### "User not found"
- Username doesn't exist on GitHub
- Check spelling

### "Repository not found"
- Repository is private or deleted
- Try a different repository

### "API rate limit exceeded"
- Made too many requests
- Wait an hour or use authentication

### "Cannot find module"
- TypeScript cache issue
- Restart dev server

## Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Verify the GitHub username exists
3. Try a different repository
4. Restart the dev server
5. Clear browser cache

## Testing with Known Good Data

Try these to verify the app works:

**Username:** `torvalds`
**Repository:** `linux`

Or:

**Username:** `gvanrossum`
**Repository:** `cpython`

These are well-known repositories with plenty of commits.
