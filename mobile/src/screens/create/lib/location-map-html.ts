export function createLocationMapHtml(latitude: string, longitude: string) {
  const lat = Number(latitude) || 48.1452;
  const lng = Number(longitude) || 17.1164;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: #F4F1EF;
      }

      .leaflet-container {
        background: #F4F1EF;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-control-attribution {
        font-size: 9px;
      }

      .event-marker-shell {
        background: transparent;
        border: 0;
      }

      .event-marker {
        position: relative;
        width: 34px;
        height: 46px;
        filter: drop-shadow(0 8px 10px rgba(32, 26, 26, 0.24));
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const selectedPoint = [${lat}, ${lng}];
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        center: selectedPoint,
        zoom: 15,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'event-marker-shell',
        iconSize: [34, 46],
        iconAnchor: [17, 40],
        html:
          '<svg class="event-marker" viewBox="0 0 34 46" aria-hidden="true">' +
            '<path d="M17 2.5C9.8 2.5 4 8.3 4 15.5c0 9.3 10.5 21 11.8 22.4 0.6 0.7 1.8 0.7 2.4 0C19.5 36.5 30 24.8 30 15.5 30 8.3 24.2 2.5 17 2.5Z" fill="#FF5A5F" stroke="#FFFCFB" stroke-width="2.8" />' +
            '<circle cx="17" cy="15.8" r="6.2" fill="#FFFCFB" />' +
            '<circle cx="17" cy="15.8" r="2.9" fill="#FFE6E3" />' +
          '</svg>',
      });
      const marker = L.marker(selectedPoint, { icon }).addTo(map);

      map.on('click', (event) => {
        const nextPoint = [event.latlng.lat, event.latlng.lng];
        marker.setLatLng(nextPoint);
        map.panTo(nextPoint);
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'locationSelected',
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        }));
      });

      setTimeout(() => map.invalidateSize(), 250);
    </script>
  </body>
</html>`;
}
