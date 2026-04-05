import * as mgrs from 'mgrs';

export function parseCoordinate(val: string): [number, number] | null {
    val = val.trim();
    if (!val) return null;

    // First try parsing as WGS84 (Lat, Lng)
    // E.g. "32.0853, 34.7818" or "32.0853 34.7818"
    const wgs84Match = val.match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/) ||
        val.match(/^([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)$/);
    if (wgs84Match) {
        const lat = parseFloat(wgs84Match[1]);
        const lng = parseFloat(wgs84Match[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return [lng, lat]; // Return as [lng, lat]
        }
    }

    // Then try MGRS / UTM
    try {
        const point = mgrs.toPoint(val);
        return [point[0], point[1]]; // [lng, lat]
    } catch (e) {
        // Not MGRS either
    }

    return null;
}

export function formatCoordinate(lng: number, lat: number, format: 'WGS84' | 'UTM'): string {
    if (format === 'WGS84') {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } else {
        return mgrs.forward([lng, lat]);
    }
}
