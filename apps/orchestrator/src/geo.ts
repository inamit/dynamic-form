import proj4 from 'proj4';

const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';

function getUTMZone(longitude: number) {
  return Math.floor((longitude + 180) / 6) + 1;
}

function getUTMProjection(zone: number, isNorth: boolean) {
  return `+proj=utm +zone=${zone} ${isNorth ? '' : '+south '}+ellps=WGS84 +datum=WGS84 +units=m +no_defs`;
}

export function parseCoordinate(val: string): [number, number] | null {
  val = val.trim();

  // Decimal degrees (e.g. "34.05, -118.25")
  let match = val.match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);
  if (match && match[1] && match[2]) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lng, lat];
    }
  }

  // UTM (e.g. "11N 384000 3768000" or "11 N 384000 3768000")
  match = val.match(/^(\d{1,2})\s*([C-X])\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i);
  if (match && match[1] && match[2] && match[3] && match[4]) {
    const zone = parseInt(match[1]);
    const band = match[2].toUpperCase();
    const easting = parseFloat(match[3]);
    const northing = parseFloat(match[4]);

    // N band is >= N (equator is N)
    const isNorth = band >= 'N';
    const utmProj = getUTMProjection(zone, isNorth);
    try {
        const [lng, lat] = proj4(utmProj, wgs84, [easting, northing]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lng, lat];
        }
    } catch (e) {
        return null;
    }
  }

  return null;
}
