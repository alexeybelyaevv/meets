import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BottomNavigation } from '@/components/bottom-navigation';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth } from '@/constants/theme';

const mapHtml = `<!DOCTYPE html>
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
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-container {
        background: #f8fafc;
      }

      .leaflet-control-attribution {
        font-size: 10px;
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

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    </script>
  </body>
</html>`;

export default function MainScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.screen}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml, baseUrl: 'https://basemaps.cartocdn.com' }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          mixedContentMode="always"
          allowsInlineMediaPlayback
          style={styles.map}
        />
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
