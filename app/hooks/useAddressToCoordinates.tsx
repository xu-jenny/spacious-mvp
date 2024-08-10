
import { useState, useCallback } from 'react';

const OPENSTREETMAP_API = 'https://nominatim.openstreetmap.org/search';

interface OSMObject {
  "place_id": number,
  "licence": string;
  "osm_type": "relation" | "node" | "way"
  "osm_id": number,
  "lat": string,
  "lon": string,
  "class": "boundary" | "place",
  "type": "administrative" | 'village',
  "place_rank": number,
  "importance": number,
  "addresstype": string;
  "name": string,
  "display_name": string,
  "boundingbox": [number, number, number, number]
}
export function useAddressToCoordinates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinates = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${OPENSTREETMAP_API}?q=${encodeURIComponent(address)}&format=json`);

      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }

      const data = await response.json();
      console.log("API response data:", data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No coordinates found for this address');
      }
     
      const match = data[0]; // Assuming the first result is the best match

      if (!match || !match.lat || !match.lon) {
        throw new Error('Invalid data structure');
      }

      const { lat, lon, name, display_name, addresstype } = match;
      return { lat, lon, name, display_name, addresstype };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchCoordinates, loading, error };
}
