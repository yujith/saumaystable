"use client";

import { useEffect, useRef, useState } from "react";

interface DeliveryMapProps {
  lat: number;
  lng: number;
  city?: string;
}

// Default center: Colombo, Sri Lanka
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

let mapOptionsSet = false;
let mapLoadPromise: Promise<google.maps.MapsLibrary> | null = null;
let markerLoadPromise: Promise<google.maps.MarkerLibrary> | null = null;

async function ensureMapLoaded(): Promise<{
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
}> {
  const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");

  if (!mapOptionsSet) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      v: "weekly",
    });
    mapOptionsSet = true;
  }

  if (!mapLoadPromise) {
    mapLoadPromise = importLibrary("maps");
  }
  if (!markerLoadPromise) {
    markerLoadPromise = importLibrary("marker");
  }

  const [maps, marker] = await Promise.all([mapLoadPromise, markerLoadPromise]);
  return { maps, marker };
}

export function DeliveryMap({ lat, lng, city }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const hasCoords = lat !== 0 && lng !== 0;
  const center = hasCoords ? { lat, lng } : DEFAULT_CENTER;

  // Load Google Maps
  useEffect(() => {
    let mounted = true;

    ensureMapLoaded()
      .then(() => {
        if (mounted) setIsLoaded(true);
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize or update the map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: hasCoords ? 15 : 11,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
        mapId: "delivery-map",
      });
      mapInstanceRef.current = map;

      if (hasCoords) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: center,
          title: city || "Delivery Location",
        });
        markerRef.current = marker;
      }
    } else {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(hasCoords ? 15 : 11);

      if (markerRef.current) {
        markerRef.current.position = center;
      } else if (hasCoords) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: center,
          title: city || "Delivery Location",
        });
        markerRef.current = marker;
      }
    }
  }, [isLoaded, lat, lng, hasCoords, center, city]);

  if (loadError) {
    return (
      <div className="relative h-full min-h-[280px] rounded-lg overflow-hidden bg-surface-container flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-4xl mb-2">map</span>
        <p className="text-xs text-secondary font-label">Map unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] rounded-lg overflow-hidden bg-surface-container">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-xs text-secondary font-label">Loading map...</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[280px]" />
      {isLoaded && !hasCoords && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container/60 backdrop-blur-[1px] pointer-events-none">
          <div className="bg-surface-container-lowest px-5 py-3 rounded-full shadow-lg font-headline font-bold text-xs">
            Search an address to see pin
          </div>
        </div>
      )}
    </div>
  );
}
