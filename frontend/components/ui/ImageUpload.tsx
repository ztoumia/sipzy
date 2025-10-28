'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label = 'Image du café', className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validation taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'Fichier trop volumineux (max 5MB)';
    }

    // Validation type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG ou WebP';
    }

    return null;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    await processFile(file);
  };

  const processFile = async (file: File) => {
    setUploading(true);
    try {
      // Créer preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Simuler upload (pour MVP, nous utilisons base64)
      // En production, remplacer par upload vers Cloudinary/S3
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload de l\'image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    await processFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-coffee-700">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-coffee-500 bg-coffee-50'
            : preview
            ? 'border-coffee-300'
            : 'border-coffee-200 hover:border-coffee-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview avec image
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          // Zone de drop
          <div
            className="p-8 text-center cursor-pointer"
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
                  <p className="text-sm text-coffee-600">Upload en cours...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-coffee-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-coffee-700">
                      Cliquez pour uploader ou glissez une image
                    </p>
                    <p className="text-sm text-coffee-500 mt-1">
                      JPG, PNG ou WebP (max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {preview && (
        <p className="text-xs text-coffee-500">
          Image sélectionnée. Vous pouvez la remplacer en cliquant dessus.
        </p>
      )}
    </div>
  );
}
