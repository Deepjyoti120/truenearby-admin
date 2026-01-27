export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const earthRadius = 6371; // km

  const latRad = (lat * Math.PI) / 180;

  const latDelta = radiusKm / earthRadius;
  const lngDelta = radiusKm / (earthRadius * Math.cos(latRad));

  const minLat = lat - (latDelta * 180) / Math.PI;
  const maxLat = lat + (latDelta * 180) / Math.PI;
  const minLng = lng - (lngDelta * 180) / Math.PI;
  const maxLng = lng + (lngDelta * 180) / Math.PI;

  return { minLat, maxLat, minLng, maxLng };
}
