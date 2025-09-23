"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 4, 
  label = "Imágenes del producto" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🖼️ DEBUG TEMPORAL - LOGGING DE IMÁGENES
  console.log('🖼️ ImageUpload received images:', images);
  console.log('🖼️ Images type:', typeof images, Array.isArray(images));
  console.log('🖼️ Images length:', images?.length);
  
  // Filtrar imágenes válidas para mostrar
  const validImages = images.filter(img => img && img.trim());
  console.log('🖼️ Valid images after filter:', validImages);
  console.log('🖼️ Valid images length:', validImages.length);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filtrar imágenes válidas (no vacías)
    const validImages = images.filter(img => img && img.trim());
    
    if (validImages.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} es demasiado grande (máximo 5MB)`);
          continue;
        }

        // Convertir imagen a base64 para almacenamiento permanente
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(base64Url);
      }

      if (newImages.length > 0) {
        // Combinar imágenes válidas existentes con las nuevas
        const updatedImages = [...validImages, ...newImages];
        onImagesChange(updatedImages);
        toast.success(`${newImages.length} imagen(es) agregada(s) exitosamente`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Error al procesar las imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const validImages = images.filter(img => img && img.trim());
    const newImages = validImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Imagen eliminada');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label} (máximo {maxImages})</Label>
        <div className="mt-2 space-y-4">
          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || validImages.length >= maxImages}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Agregar Imágenes
                </>
              )}
            </Button>
            <span className="text-sm text-gray-500">
              {validImages.length} / {maxImages} imágenes
            </span>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image Preview Grid */}
          {validImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {validImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-image.svg';
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {validImages.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay imágenes agregadas</p>
              <p className="text-sm text-gray-400">
                Haz clic en "Agregar Imágenes" para incluir fotos del producto
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}