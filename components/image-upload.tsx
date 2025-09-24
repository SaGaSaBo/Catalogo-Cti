"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMultipleImagesToSupabase, deleteImageFromSupabase } from '@/lib/image-upload';

interface ImageUploadProps {
  images: string[]; // URLs públicas de Supabase Storage
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

  // Filtrar imágenes válidas para mostrar (URLs de Supabase Storage)
  const validImages = images.filter(img => img && img.trim());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (validImages.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);

    try {
      // 1. SUBIR IMÁGENES A SUPABASE STORAGE
      const fileArray = Array.from(files);
      const uploadResults = await uploadMultipleImagesToSupabase(fileArray);

      // 2. PROCESAR RESULTADOS
      const successfulUploads: string[] = [];
      const errors: string[] = [];

      uploadResults.forEach((result, index) => {
        if (result.success && result.url) {
          successfulUploads.push(result.url);
        } else {
          errors.push(result.error || `Error desconocido con ${fileArray[index].name}`);
        }
      });

      // 3. MOSTRAR RESULTADOS
      if (successfulUploads.length > 0) {
        const updatedImages = [...validImages, ...successfulUploads];
        onImagesChange(updatedImages);
        toast.success(`${successfulUploads.length} imagen(es) subida(s) exitosamente`);
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }

    } catch (error) {
      console.error('❌ Error procesando imágenes:', error);
      toast.error('Error al procesar las imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const validImages = images.filter(img => img && img.trim());
    const imageToRemove = validImages[index];
    
    if (!imageToRemove) return;

    try {
      // Intentar eliminar de Supabase Storage si es una URL de Storage
      const isSupabaseUrl = imageToRemove.includes('supabase') && imageToRemove.includes('/storage/v1/object/public/');
      
      if (isSupabaseUrl) {
        const deleted = await deleteImageFromSupabase(imageToRemove);
        if (deleted) {
          console.log('✅ Imagen eliminada de Supabase Storage');
        } else {
          console.log('⚠️ No se pudo eliminar de Supabase Storage, pero se removerá de la lista');
        }
      }

      // Remover de la lista local
      const newImages = validImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Imagen eliminada');

    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error);
      // Aún así remover de la lista local
      const newImages = validImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Imagen eliminada de la lista');
    }
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
                  Subiendo a Supabase...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Imágenes
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
                Haz clic en "Subir Imágenes" para subir fotos a Supabase Storage
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}