// Free map component using OpenStreetMap + Leaflet inside a WebView.
// Drop-in replacement for the parts of react-native-maps this app uses:
//   import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "../../components/OSMMap";
// No Google API key or billing needed.
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

export const PROVIDER_GOOGLE = undefined;
export const PROVIDER_DEFAULT = undefined;

type MarkerProps = {
  coordinate: LatLng;
  title?: string;
  description?: string;
  pinColor?: string;
  rotation?: number;
  anchor?: { x: number; y: number };
  /** Round icon to show instead of a pin. Defaults to "bus" when the Marker has custom children. */
  icon?: "bus" | "parcel";
  children?: React.ReactNode;
};
type PolylineProps = {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
};

// These render nothing themselves; MapView reads their props.
export function Marker(_: MarkerProps) {
  return null;
}
export function Polyline(_: PolylineProps) {
  return null;
}

type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  showsScale?: boolean;
  children?: React.ReactNode;
  // Accepted for compatibility, ignored:
  provider?: unknown;
  showsCompass?: boolean;
  showsMyLocationButton?: boolean;
};

export type MapViewHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (
    coords: LatLng[],
    opts?: {
      edgePadding?: { top: number; right: number; bottom: number; left: number };
      animated?: boolean;
    }
  ) => void;
};

const deltaToZoom = (delta: number) =>
  Math.max(2, Math.min(19, Math.round(Math.log2(360 / Math.max(delta, 0.0005)))));

// Walk children (including fragments and helper-returned elements) to collect markers/polylines.
function collect(children: React.ReactNode) {
  const markers: any[] = [];
  const lines: any[] = [];
  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      const el = child as React.ReactElement<any>;
      if (el.type === Marker) {
        const p = el.props as MarkerProps;
        if (!p.coordinate) return;
        markers.push({
          lat: p.coordinate.latitude,
          lng: p.coordinate.longitude,
          title: p.title ?? "",
          description: p.description ?? "",
          color: p.pinColor ?? "#E53935",
          rotation: p.rotation ?? 0,
          icon: p.icon ?? (p.children ? "bus" : null),
        });
      } else if (el.type === Polyline) {
        const p = el.props as PolylineProps;
        if (!p.coordinates?.length) return;
        lines.push({
          points: p.coordinates.map((c) => [c.latitude, c.longitude]),
          color: p.strokeColor ?? "#2F80ED",
          width: p.strokeWidth ?? 4,
          dash:
            p.lineDashPattern && p.lineDashPattern.length > 1
              ? p.lineDashPattern.join(",")
              : null,
        });
      } else if ((el.props as any)?.children) {
        walk((el.props as any).children);
      }
    });
  };
  walk(children);
  return { markers, lines };
}

const buildHtml = (region: Region, showsUserLocation: boolean, showsScale: boolean) => `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:#e8eef5}
  .ring{width:44px;height:44px;border-radius:22px;background:rgba(21,91,138,.25);display:flex;align-items:center;justify-content:center}
  .dot{width:34px;height:34px;border-radius:17px;background:#155B8A;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3)}
  .me{width:16px;height:16px;border-radius:8px;background:#2F80ED;border:3px solid #fff;box-shadow:0 0 0 6px rgba(47,128,237,.25)}
</style></head><body><div id="map"></div>
<script>
  var ICONS = {
    bus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm1.5-6H6V6h12v5z"/></svg>',
    parcel: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>'
  };
  var map = L.map('map', { zoomControl: true, attributionControl: true })
    .setView([${region.latitude}, ${region.longitude}], ${deltaToZoom(region.latitudeDelta)});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);
  ${showsScale ? "L.control.scale().addTo(map);" : ""}

  var layer = L.layerGroup().addTo(map);
  function pinIcon(color) {
    return L.divIcon({ className: '', iconSize: [28, 40], iconAnchor: [14, 40], popupAnchor: [0, -36],
      html: '<svg width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="' + color + '"/><circle cx="14" cy="14" r="5.5" fill="#fff"/></svg>' });
  }
  function roundIcon(name, rotation) {
    return L.divIcon({ className: '', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -20],
      html: '<div class="ring"><div class="dot" style="transform:rotate(' + (rotation || 0) + 'deg)">' + (ICONS[name] || ICONS.bus) + '</div></div>' });
  }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  window.updateMap = function (data) {
    layer.clearLayers();
    (data.lines || []).forEach(function (l) {
      L.polyline(l.points, { color: l.color, weight: l.width, dashArray: l.dash }).addTo(layer);
    });
    (data.markers || []).forEach(function (m) {
      var icon = m.icon ? roundIcon(m.icon, m.rotation) : pinIcon(m.color);
      var mk = L.marker([m.lat, m.lng], { icon: icon }).addTo(layer);
      if (m.title || m.description) mk.bindPopup('<b>' + esc(m.title) + '</b>' + (m.description ? '<br/>' + esc(m.description) : ''));
    });
  };
  window.animateToRegion = function (lat, lng, zoom, ms) {
    map.flyTo([lat, lng], zoom, { duration: Math.max(ms || 0, 1) / 1000 });
  };
  window.fitTo = function (pts, pad, animated) {
    if (!pts.length) return;
    map.fitBounds(L.latLngBounds(pts), {
      paddingTopLeft: [pad.left, pad.top], paddingBottomRight: [pad.right, pad.bottom], animate: animated
    });
  };

  ${
    showsUserLocation
      ? `var me = null;
  map.on('locationfound', function (e) {
    if (!me) me = L.marker(e.latlng, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }), interactive: false }).addTo(map);
    else me.setLatLng(e.latlng);
  });
  map.locate({ watch: true, setView: false, enableHighAccuracy: true });`
      : ""
  }
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready');
</script></body></html>`;

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { style, initialRegion, showsUserLocation = false, showsScale = false, children },
  ref
) {
  const webRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string[]>([]);

  // Build the page once; later changes are sent as small JS updates (no reload/flicker).
  const html = useMemo(
    () =>
      buildHtml(
        initialRegion ?? { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3, longitudeDelta: 3 },
        showsUserLocation,
        showsScale
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const run = useCallback((js: string) => {
    if (readyRef.current) webRef.current?.injectJavaScript(js + ";true;");
    else pendingRef.current.push(js);
  }, []);

  const { markers, lines } = collect(children);
  const dataJson = JSON.stringify({ markers, lines });

  useEffect(() => {
    run(`window.updateMap(${dataJson})`);
  }, [dataJson, run]);

  useImperativeHandle(
    ref,
    () => ({
      animateToRegion: (region, duration = 500) =>
        run(
          `window.animateToRegion(${region.latitude}, ${region.longitude}, ${deltaToZoom(
            region.latitudeDelta
          )}, ${duration})`
        ),
      fitToCoordinates: (coords, opts) => {
        const pad = opts?.edgePadding ?? { top: 40, right: 40, bottom: 40, left: 40 };
        const pts = JSON.stringify(coords.map((c) => [c.latitude, c.longitude]));
        run(`window.fitTo(${pts}, ${JSON.stringify(pad)}, ${opts?.animated !== false})`);
      },
    }),
    [run]
  );

  const onMessage = (e: { nativeEvent: { data: string } }) => {
    if (e.nativeEvent.data !== "ready") return;
    readyRef.current = true;
    webRef.current?.injectJavaScript(`window.updateMap(${dataJson});true;`);
    pendingRef.current.forEach((js) => webRef.current?.injectJavaScript(js + ";true;"));
    pendingRef.current = [];
  };

  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://jetlink.app/" }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled={showsUserLocation}
        setSupportMultipleWindows={false}
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
});

export default MapView;
