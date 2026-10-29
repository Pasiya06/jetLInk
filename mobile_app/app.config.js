// Extends app.json. Maps now use free OpenStreetMap (components/OSMMap.tsx),
// so no Google Maps key is required. If you ever add one, set GOOGLE_MAPS_API_KEY.
module.exports = ({ config }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return config;
  return {
    ...config,
    android: {
      ...config.android,
      config: { ...(config.android?.config ?? {}), googleMaps: { apiKey } },
    },
  };
};
