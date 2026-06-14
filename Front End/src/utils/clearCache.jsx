// Utility function to clear cached business data
export const clearBusinessCache = () => {
  const cacheKeys = [
    'serviceProviders',
    'registeredProviders', 
    'businesses',
    'providers',
    'featuredServices'
  ];
  
  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ Business cache cleared');
};

// Clear cache on page load to ensure fresh data
export const clearCacheOnLoad = () => {
  if (typeof window !== 'undefined') {
    clearBusinessCache();
  }
};
