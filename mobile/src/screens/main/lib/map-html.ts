import type { FeaturedPlan } from "../types";

export function createMapHtml(
  plans: FeaturedPlan[],
  testImageUrls: readonly string[] = [],
) {
  const mapPoints = JSON.stringify(
    plans.map(({ id, latitude, longitude, title }, index) => ({
      id,
      imageUrl:
        testImageUrls.length > 0
          ? testImageUrls[index % testImageUrls.length]
          : null,
      latitude,
      longitude,
      title,
    })),
  ).replace(/</g, "\\u003c");

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
        overflow: visible;
        pointer-events: none;
      }

      .leaflet-marker-icon.event-marker-shell {
        opacity: 1;
      }

      .event-marker {
        position: relative;
        width: 196px;
        height: 58px;
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px) scale(0.9);
        animation: markerEnter 420ms cubic-bezier(0.2, 0.85, 0.25, 1.15)
          var(--marker-delay, 0ms) forwards;
      }

      .event-marker__bubble {
        position: relative;
        z-index: 3;
        width: max-content;
        min-width: 76px;
        max-width: 188px;
        height: 42px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-sizing: border-box;
        padding: 4px 12px 4px 4px;
        border: 1px solid rgba(32, 26, 26, 0.08);
        border-radius: 22px;
        background: #fffcfb;
        box-shadow:
          0 9px 20px rgba(32, 26, 26, 0.13),
          0 2px 5px rgba(32, 26, 26, 0.08);
        pointer-events: auto;
        overflow: visible;
        transform-origin: 22px 100%;
        transition:
          border-color 160ms ease,
          background-color 160ms ease,
          box-shadow 180ms ease,
          transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .event-marker__bubble::after {
        content: '';
        position: absolute;
        z-index: -1;
        left: 16px;
        bottom: -5px;
        width: 10px;
        height: 10px;
        border-right: 1px solid rgba(32, 26, 26, 0.08);
        border-bottom: 1px solid rgba(32, 26, 26, 0.08);
        border-bottom-right-radius: 3px;
        background: #fffcfb;
        transform: rotate(45deg);
        transition:
          background-color 160ms ease,
          border-color 160ms ease;
      }

      .event-marker__image {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        display: block;
        width: 34px;
        height: 34px;
        box-sizing: border-box;
        border: 2px solid rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        background:
          linear-gradient(135deg, #ffe6e3 0%, #f4f1ef 55%, #ddd5d1 100%);
        object-fit: cover;
        transition: border-color 160ms ease;
      }

      .event-marker__title {
        min-width: 0;
        max-width: 138px;
        overflow: hidden;
        color: #201a1a;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: -0.1px;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 160ms ease;
      }

      .event-marker__ground {
        position: absolute;
        z-index: 1;
        left: 11px;
        top: 51px;
        width: 22px;
        height: 5px;
        border-radius: 50%;
        background: rgba(32, 26, 26, 0.16);
        filter: blur(2px);
        transition:
          opacity 180ms ease,
          transform 180ms ease;
      }

      .event-marker:hover .event-marker__bubble {
        transform: translateY(-2px);
        box-shadow:
          0 13px 25px rgba(32, 26, 26, 0.16),
          0 3px 6px rgba(32, 26, 26, 0.09);
      }

      .event-marker.is-selected .event-marker__bubble {
        border-color: #ff5a5f;
        background: #ff5a5f;
        box-shadow:
          0 14px 28px rgba(255, 90, 95, 0.3),
          0 3px 7px rgba(32, 26, 26, 0.12);
        transform: translateY(-4px) scale(1.06);
      }

      .event-marker.is-selected .event-marker__bubble::after {
        border-color: #ff5a5f;
        background: #ff5a5f;
      }

      .event-marker.is-selected .event-marker__image {
        border-color: #fffcfb;
      }

      .event-marker.is-selected .event-marker__title {
        color: #ffffff;
      }

      .event-marker.is-selected .event-marker__ground {
        opacity: 0.7;
        transform: scaleX(1.3);
      }

      @keyframes markerEnter {
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .event-marker {
          opacity: 1;
          transform: none;
          animation: none;
        }

        .event-marker__bubble,
        .event-marker__bubble::after,
        .event-marker__image,
        .event-marker__title,
        .event-marker__ground {
          transition: none;
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
      const markersById = new Map();
      let selectedMarkerId = null;

      function createMarkerHtml(point, index) {
        const markerElement = document.createElement('div');
        markerElement.className = 'event-marker';
        markerElement.style.setProperty(
          '--marker-delay',
          Math.min(index * 45, 270) + 'ms',
        );

        const bubbleElement = document.createElement('div');
        bubbleElement.className = 'event-marker__bubble';

        const imageElement = document.createElement('img');
        imageElement.className = 'event-marker__image';
        imageElement.alt = '';
        imageElement.decoding = 'async';

        if (point.imageUrl) {
          imageElement.src = point.imageUrl;
        }

        const titleElement = document.createElement('span');
        titleElement.className = 'event-marker__title';
        titleElement.textContent = point.title;

        const groundElement = document.createElement('span');
        groundElement.className = 'event-marker__ground';

        bubbleElement.append(imageElement, titleElement);
        markerElement.append(bubbleElement, groundElement);

        return markerElement.outerHTML;
      }

      function setSelectedMarker(id) {
        if (selectedMarkerId && markersById.has(selectedMarkerId)) {
          const previous = markersById.get(selectedMarkerId);
          previous.element?.classList.remove('is-selected');
          previous.marker.setZIndexOffset(0);
        }

        selectedMarkerId = typeof id === 'string' ? id : null;

        if (!selectedMarkerId || !markersById.has(selectedMarkerId)) {
          return;
        }

        const selected = markersById.get(selectedMarkerId);
        selected.element?.classList.add('is-selected');
        selected.marker.setZIndexOffset(1000);
      }

      points.forEach((point, index) => {
        const icon = L.divIcon({
          className: 'event-marker-shell',
          iconSize: [196, 58],
          iconAnchor: [22, 53],
          html: createMarkerHtml(point, index),
        });

        const marker = L.marker([point.latitude, point.longitude], {
          icon,
          keyboard: true,
          riseOnHover: true,
          title: point.title,
        }).addTo(map);

        markersById.set(point.id, {
          element: marker.getElement()?.querySelector('.event-marker'),
          marker,
        });

        marker.on('click', () => {
          setSelectedMarker(point.id);
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'selectPlan',
            id: point.id,
          }));
        });
      });

      function handleNativeMessage(event) {
        try {
          const message =
            typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          if (message?.type === 'setSelectedPlan') {
            setSelectedMarker(message.id);
          }
        } catch {
          // Ignore messages not intended for the map.
        }
      }

      window.addEventListener('message', handleNativeMessage);
      document.addEventListener('message', handleNativeMessage);

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
