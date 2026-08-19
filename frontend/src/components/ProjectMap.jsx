import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { projectCoordinates } from '../data/projectCoordinates';

// Fix for default Leaflet marker icons in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Custom colored SVG pin
const createColorPin = (color, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 13 17 27 17 27S34 30 34 17C34 7.6 26.4 0 17 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="17" cy="17" r="8" fill="white"/>
      <text x="17" y="21" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44]
  });
};

const CRITICAL_ICON = createColorPin('#dc2626', '!');
const ATTENTION_ICON = createColorPin('#f97316', '⚠');
const FALLBACK_ICON = createColorPin('#3b82f6', '★');

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

const ProjectMap = ({ project }) => {
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasGPS, setHasGPS] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const staticCoords = projectCoordinates[project];
  const fallbackCenter = staticCoords ? [staticCoords.lat, staticCoords.lng] : [20.5937, 78.9629];

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    import('../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getMapData(project).then(res => {
        const data = res?.data || res;
        if (data?.type === 'GPS_POINTS' && data.points?.length > 0) {
          // Filter only Critical and Needs Attention
          const filtered = data.points.filter(p =>
            p.health === 'Critical' || p.health === 'Needs Attention'
          );

          // Jitter overlapping points
          const coordMap = {};
          filtered.forEach(p => {
            // Round to 5 decimals to group very close points
            const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
            if (!coordMap[key]) coordMap[key] = [];
            coordMap[key].push(p);
          });

          const processedPoints = [];
          Object.values(coordMap).forEach(group => {
            if (group.length === 1) {
              processedPoints.push(group[0]);
            } else {
              // Apply a small spiral/circle offset
              const offsetRadius = 0.00015; // ~15 meters
              group.forEach((p, index) => {
                const angle = (index / group.length) * 2 * Math.PI;
                processedPoints.push({
                  ...p,
                  lat: p.lat + Math.cos(angle) * offsetRadius,
                  lng: p.lng + Math.sin(angle) * offsetRadius
                });
              });
            }
          });

          setMapPoints(processedPoints);
          setHasGPS(true);
        } else {
          setMapPoints([]);
          setHasGPS(false);
        }
        setLoading(false);
      }).catch(err => { console.error(err); setLoading(false); });
    });
  }, [project]);

  const mapCenter = mapPoints.length > 0
    ? [mapPoints[0].lat, mapPoints[0].lng]
    : fallbackCenter;

  const zoom = hasGPS ? 14 : 12;

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500 font-medium">Loading map data…</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow" />
          <span className="text-xs font-semibold text-gray-700">Critical (1 Ratings)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow" />
          <span className="text-xs font-semibold text-gray-700">Needs Attention (5 Ratings)</span>
        </div>
        {!hasGPS && !loading && (
          <span className="ml-auto text-[11px] text-gray-400 italic">No GPS data — showing project location</span>
        )}
        {hasGPS && !loading && (
          <span className="ml-auto text-[11px] font-semibold text-green-600">{mapPoints.length} issue{mapPoints.length !== 1 ? 's' : ''} plotted</span>
        )}
      </div>

      <div className="w-full h-[440px] rounded-xl overflow-hidden border border-borderColor shadow-sm relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={mapCenter} zoom={zoom} />

          {/* No GPS - show fallback project pin */}
          {!hasGPS && !loading && staticCoords && (
            <Marker position={fallbackCenter} icon={FALLBACK_ICON}>
              <Popup>
                <div className="text-center p-1">
                  <strong className="text-gray-800 block">{staticCoords.full_name || project}</strong>
                  <span className="text-xs text-gray-500">{staticCoords.state}</span>
                  <p className="text-xs text-blue-600 mt-1 italic">No GPS-rated data available yet</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Real GPS Issue Markers */}
          {mapPoints.map((point) => {
            const isCritical = point.health === 'Critical';
            const icon = isCritical ? CRITICAL_ICON : ATTENTION_ICON;
            const badgeColor = isCritical ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200';
            const score = point.score !== null ? point.score : 'N/A';

            return (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={icon}
              >
                <Popup maxWidth={280} minWidth={220}>
                  <div className="text-sm font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-2 py-1.5 rounded-t mb-2 border ${badgeColor}`}>
                      <span className="font-bold text-xs uppercase tracking-wide">{point.health}</span>
                      <span className="font-black text-base">{score}</span>
                    </div>

                    {/* Details */}
                    <div className="px-1 space-y-1 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Chainage</span>
                        <span className="font-semibold text-gray-800">{point.chainage}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Asset Type</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[120px] text-right">{point.assetType || '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">GPS</span>
                        <span className="text-gray-400">{point.lat?.toFixed(5)}, {point.lng?.toFixed(5)}</span>
                      </div>
                      {point.remarks && (
                        <div className="flex justify-between text-xs mt-1 pt-1 border-t border-gray-100">
                          <span className="text-gray-500">Remarks</span>
                          <span className="font-medium text-red-600 text-right max-w-[140px] truncate" title={point.remarks}>
                            {point.remarks}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Issue Photo */}
                    {point.imageUrl ? (
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedImage({ url: point.imageUrl, point })}
                      >
                        <img
                          src={point.imageUrl}
                          alt={`Chainage ${point.chainage}`}
                          className="w-full h-28 object-cover rounded border border-gray-200 hover:opacity-90 transition-opacity"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <p className="text-[10px] text-center text-blue-600 mt-1 cursor-pointer hover:underline">
                          Click to enlarge photo
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border border-gray-200">
                        No photo available
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Full-screen Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Lightbox header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Issue Photo — Chainage {selectedImage.point.chainage}</h3>
                <p className="text-xs text-gray-500">{selectedImage.point.assetType} · {selectedImage.point.health} · Score: {selectedImage.point.score}</p>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>

            {/* Image */}
            <div className="relative bg-gray-50">
              <img
                src={selectedImage.url}
                alt={`Issue at Chainage ${selectedImage.point.chainage}`}
                className="w-full max-h-[500px] object-contain"
              />
            </div>

            {/* Remarks */}
            {selectedImage.point.remarks && (
              <div className="px-5 py-3 bg-red-50 border-t border-red-100">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">Inspector Remarks</h4>
                <p className="text-sm text-red-700">{selectedImage.point.remarks}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  selectedImage.point.health === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedImage.point.health}
                </span>
                <span className="text-xs text-gray-500">
                  GPS: {selectedImage.point.lat?.toFixed(5)}, {selectedImage.point.lng?.toFixed(5)}
                </span>
              </div>
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Open full size ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMap;
