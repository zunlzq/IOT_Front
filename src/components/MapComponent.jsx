"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapComponent({ workers }) {
  const center = workers.length > 0 && workers[0].gps_lat 
    ? [workers[0].gps_lat, workers[0].gps_lng] 
    : [37.5665, 126.9780];

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {workers.map((worker) => {
          if (!worker.gps_lat || !worker.gps_lng) return null;

          const isEmergency = worker.overall_status_code === 'emergency';
          
          return (
            <Marker key={worker.id} position={[worker.gps_lat, worker.gps_lng]}>
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <h3 className="font-bold text-sm mb-1">{worker.name}</h3>
                  <p className="text-xs text-slate-600 mb-1">ID: {worker.id}</p>
                  <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                    isEmergency ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isEmergency ? '비상 상황 (SOS)' : '정상'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
