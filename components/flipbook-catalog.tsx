"use client";

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlipbookCatalogProps {
  products: Product[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function FlipbookCatalog({ products, currentPage, onPageChange }: FlipbookCatalogProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Products per page: 2 on desktop, 1 on mobile
  const productsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Get current products
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isFlipping) return;
    
    setIsFlipping(true);
    
    // Add flip animation delay
    setTimeout(() => {
      onPageChange(newPage);
      setIsFlipping(false);
    }, 300);
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Flipbook Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Page Content */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isFlipping && "opacity-50 scale-95"
          )}
        >
          {/* Desktop: 2 products side by side */}
          {!isMobile ? (
            <div className="grid grid-cols-2 min-h-[800px]">
              {/* Left Page */}
              <div className="border-r border-gray-200 p-8">
                {currentProducts[0] ? (
                  <ProductCard product={currentProducts[0]} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <RotateCcw className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Página en blanco</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Page */}
              <div className="p-8">
                {currentProducts[1] ? (
                  <ProductCard product={currentProducts[1]} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <RotateCcw className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Página en blanco</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mobile: 1 product per page */
            <div className="p-6 min-h-[600px]">
              {currentProducts[0] ? (
                <ProductCard product={currentProducts[0]} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <RotateCcw className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Página en blanco</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Number Indicator */}
        <div className="absolute top-4 right-4 bg-black/10 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrev || isFlipping}
          className="flex items-center gap-2 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Página Anterior</span>
          <span className="sm:hidden">Anterior</span>
        </Button>

        {/* Page Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={isFlipping}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  isActive 
                    ? "bg-blue-600 scale-125" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Ir a página ${pageNum}`}
              />
            );
          })}
          
          {totalPages > 10 && (
            <>
              <span className="text-gray-400 mx-2">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={isFlipping}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  totalPages === currentPage 
                    ? "bg-blue-600 scale-125" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Ir a página ${totalPages}`}
              />
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext || isFlipping}
          className="flex items-center gap-2 shadow-lg"
        >
          <span className="hidden sm:inline">Página Siguiente</span>
          <span className="sm:hidden">Siguiente</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Navigation */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border">
          <span className="text-sm text-gray-600">Ir a página:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                handlePageChange(page);
              }
            }}
            className="w-16 text-center text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            disabled={isFlipping}
          />
          <span className="text-sm text-gray-400">de {totalPages}</span>
        </div>
      </div>
    </div>
  );
}