// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/**
 * Calculate qibla direction from a given location
 * Returns the bearing in degrees from North (0-360)
 */
export function calculateQiblaDirection(lat: number, lng: number): number {
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng);
  const kaabaLatRad = toRadians(KAABA_LAT);
  const kaabaLngRad = toRadians(KAABA_LNG);

  const deltaLng = kaabaLngRad - lngRad;

  const x = Math.sin(deltaLng);
  const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(deltaLng);

  let qibla = toDegrees(Math.atan2(x, y));
  
  // Normalize to 0-360
  if (qibla < 0) {
    qibla += 360;
  }

  return qibla;
}

/**
 * Calculate distance to Kaaba in kilometers using Haversine formula
 */
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  
  const latRad = toRadians(lat);
  const kaabaLatRad = toRadians(KAABA_LAT);
  const deltaLat = toRadians(KAABA_LAT - lat);
  const deltaLng = toRadians(KAABA_LNG - lng);

  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(latRad) * Math.cos(kaabaLatRad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
