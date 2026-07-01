"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertTriangle, Activity } from "lucide-react";

// Fix missing marker icons in leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mock realtime data for Indonesia
const initialDiseaseData = [
  { id: 1, name: "Dengue Fever", lat: -6.2088, lng: 106.8456, cases: 450, risk: "High", city: "Jakarta" },
  { id: 2, name: "Malaria", lat: -2.5489, lng: 118.0149, cases: 120, risk: "Moderate", city: "Kalimantan" },
  { id: 3, name: "Typhoid", lat: -7.2504, lng: 112.7688, cases: 300, risk: "High", city: "Surabaya" },
  { id: 4, name: "Tuberculosis", lat: 3.5952, lng: 98.6722, cases: 85, risk: "Moderate", city: "Medan" },
  { id: 5, name: "Avian Influenza", lat: -8.4095, lng: 115.1889, cases: 12, risk: "Critical", city: "Bali" }
];

export default function DiseaseMap() {
  const [diseaseData, setDiseaseData] = useState(initialDiseaseData);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate realtime polling updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDiseaseData(prev => prev.map(d => ({
        ...d,
        cases: d.cases + Math.floor(Math.random() * 5) - 1 // Randomly increase/decrease cases slightly
      })));
      setLastUpdated(new Date());
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Live Geospatial Intelligence
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time AI surveillance of infectious disease spread across Indonesia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-700">
            Live Connection
          </span>
          <span className="text-xs text-gray-400 ml-2">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="h-[500px] w-full relative z-0">
        <MapContainer 
          center={[-0.7893, 113.9213]} // Center of Indonesia
          zoom={5} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {diseaseData.map(data => {
            const color = data.risk === 'Critical' ? 'red' : data.risk === 'High' ? 'orange' : 'blue';
            
            return (
              <React.Fragment key={data.id}>
                {/* Visual heat radius */}
                <CircleMarker 
                  center={[data.lat, data.lng]}
                  radius={Math.max(10, data.cases / 10)}
                  fillColor={color}
                  color={color}
                  weight={1}
                  opacity={0.4}
                  fillOpacity={0.2}
                />
                
                {/* Specific location marker */}
                <Marker position={[data.lat, data.lng]} icon={customIcon}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{data.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{data.city}, Indonesia</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Active Cases</p>
                          <p className="font-semibold text-gray-900">{data.cases}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Risk Level</p>
                          <p className={`font-semibold ${data.risk === 'Critical' ? 'text-red-600' : data.risk === 'High' ? 'text-orange-600' : 'text-blue-600'}`}>
                            {data.risk}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-2 rounded border border-blue-100 flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-snug">
                          <strong>AI Assessment:</strong> Outbreak velocity is increasing. Recommend deployment of specialized units.
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
