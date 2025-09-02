"use client";

import { Suspense } from 'react';
import { CatalogPageContent } from './catalog-content';

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="animate-pulse rounded-md bg-muted h-8 w-64 mx-auto mb-2"></div>
              <div className="animate-pulse rounded-md bg-muted h-4 w-48 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="animate-pulse rounded-md bg-muted h-64 w-full mb-4"></div>
                <div className="animate-pulse rounded-md bg-muted h-6 w-48 mb-2"></div>
                <div className="animate-pulse rounded-md bg-muted h-8 w-24 mb-4"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="animate-pulse rounded-md bg-muted h-64 w-full mb-4"></div>
                <div className="animate-pulse rounded-md bg-muted h-6 w-48 mb-2"></div>
                <div className="animate-pulse rounded-md bg-muted h-8 w-24 mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CatalogPageContent />
    </Suspense>
  );
}