import type { FeaturedPlan } from "../types";

export function createMapHtml(plans: FeaturedPlan[]) {
  const mapPoints = JSON.stringify(
    plans.map(({ id, latitude, longitude }) => ({
      id,
      latitude,
      longitude,
    })),
  );

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f4f1ef;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-container {
        background: #f4f1ef;
      }

      .leaflet-control-attribution {
        font-size: 10px;
      }

      .event-marker-shell {
        background: transparent;
        border: 0;
        opacity: 1;
        transition: none;
        will-change: transform;
      }

      .leaflet-marker-icon.event-marker-shell {
        opacity: 1;
      }

      .event-marker {
        position: relative;
        width: 34px;
        height: 46px;
      }

      .event-marker__icon {
        position: relative;
        z-index: 2;
        display: block;
        width: 34px;
        height: 46px;
        filter: drop-shadow(0 7px 8px rgba(32, 26, 26, 0.18));
      }

      .event-marker__halo {
        position: absolute;
        left: 6px;
        top: 6px;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: rgba(255, 90, 95, 0.1);
        box-shadow: 0 0 0 5px rgba(255, 90, 95, 0.05);
        z-index: -1;
      }

      .event-marker__pulse {
        position: absolute;
        left: 17px;
        top: 40px;
        width: 8px;
        height: 8px;
        margin-left: -4px;
        margin-top: -4px;
        border-radius: 999px;
        background: rgba(255, 90, 95, 0.38);
        pointer-events: none;
        z-index: 1;
      }

      .event-marker__pulse::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(255, 90, 95, 0.34);
        animation: markerPulse 1.8s ease-out infinite;
      }

      @keyframes markerPulse {
        0% {
          opacity: 0.7;
          transform: scale(0.8);
        }

        70% {
          opacity: 0;
          transform: scale(3.2);
        }

        100% {
          opacity: 0;
          transform: scale(3.2);
        }
      }

    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        center: [48.1452, 17.1164],
        zoom: 14,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      const points = ${mapPoints};

      points.forEach((point) => {
        const icon = L.divIcon({
          className: 'event-marker-shell',
          iconSize: [34, 46],
          iconAnchor: [17, 40],
          popupAnchor: [0, -36],
          html:
            '<div class="event-marker">' +
              '<div class="event-marker__halo"></div>' +
              '<div class="event-marker__pulse"></div>' +
              '<svg class="event-marker__icon" viewBox="0 0 34 46" aria-hidden="true">' +
                '<path d="M17 2.5C9.8 2.5 4 8.3 4 15.5c0 9.3 10.5 21 11.8 22.4 0.6 0.7 1.8 0.7 2.4 0C19.5 36.5 30 24.8 30 15.5 30 8.3 24.2 2.5 17 2.5Z" fill="#FF5A5F" stroke="#FFFCFB" stroke-width="2.8" />' +
                '<circle cx="17" cy="15.8" r="6.2" fill="#FFFCFB" />' +
                '<circle cx="17" cy="15.8" r="2.9" fill="#FFE6E3" />' +
              '</svg>' +
            '</div>',
        });

        L.marker([point.latitude, point.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'selectPlan',
              id: point.id,
            }));
          });
      });

      if (points.length > 0) {
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
        map.fitBounds(bounds, {
          paddingTopLeft: [52, 118],
          paddingBottomRight: [52, 270],
          maxZoom: 15,
        });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    </script>
  </body>
</html>`;
}
