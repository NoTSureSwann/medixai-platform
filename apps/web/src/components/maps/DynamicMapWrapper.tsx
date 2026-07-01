"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('@/components/maps/DiseaseMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-xl animate-pulse"><p className="text-gray-500">Loading Geospatial Data...</p></div>
});

export default function DynamicMapWrapper() {
  return <DynamicMap />;
}
