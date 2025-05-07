/**
 * spa-redirect.js
 * 
 * This script handles client-side routing for a statically exported Next.js app.
 * It preserves the URL on page load and handles redirects appropriately.
 */

// Execute immediately when the script loads
(function() {
  // Save the current URL
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  
  // Don't redirect for assets or the homepage
  if (currentPath === '/' || 
      currentPath.startsWith('/_next/') || 
      currentPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|html)$/)) {
    return;
  }
  
  // Create the redirect URL
  const redirectUrl = '/' + (currentSearch ? currentSearch + '&' : '?') + 
                      'redirect=' + encodeURIComponent(currentPath);
  
  // Perform the redirect
  window.location.replace(redirectUrl);
})();