"use client";

import { Suspense } from 'react';
import { CatalogPageContent } from './catalog-content';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    }>
      <CatalogPageContent />
    </Suspense>
  );
}