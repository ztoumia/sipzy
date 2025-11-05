'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityMetadata, FieldMetadata } from '@/lib/api/dataManagementApi';

interface EntityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  metadata: EntityMetadata;
  onSave: (updates: Record<string, any>) => Promise<void>;
}

export function EntityEditModal({
  isOpen,
  onClose,
  entity,
  metadata,
  onSave,
}: EntityEditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entity) {
      setFormData({ ...entity });
    }
  }, [entity]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Only send editable fields that have changed
      const updates: Record<string, any> = {};
      const editableFields = metadata.fields.filter((f) => f.editable);

      editableFields.forEach((field) => {
        if (formData[field.name] !== entity[field.name]) {
          updates[field.name] = formData[field.name];
        }
      });

      await onSave(updates);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: FieldMetadata) => {
    const value = formData[field.name];

    if (!field.editable) {
      return null;
    }

    // Skip password and token fields
    if (
      field.name.toLowerCase().includes('password') ||
      field.name.toLowerCase().includes('token')
    ) {
      return null;
    }

    const commonClasses =
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent';

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              checked={value || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="text-sm text-gray-700">
              {field.displayName}
            </label>
          </div>
        );

      case 'enum':
        return (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.displayName}
              {!field.nullable && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.name}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={commonClasses}
              required={!field.nullable}
            >
              {field.nullable && <option value="">-</option>}
              {field.enumValues?.map((enumValue) => (
                <option key={enumValue} value={enumValue}>
                  {enumValue}
                </option>
              ))}
            </select>
          </div>
        );

      case 'number':
        return (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.displayName}
              {!field.nullable && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={field.name}
              value={value || ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className={commonClasses}
              required={!field.nullable}
            />
          </div>
        );

      case 'date':
        return (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.displayName}
            </label>
            <input
              type="text"
              id={field.name}
              value={value ? new Date(value).toLocaleString('fr-FR') : ''}
              disabled
              className={`${commonClasses} bg-gray-100 cursor-not-allowed`}
            />
          </div>
        );

      case 'relation':
        return (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.displayName}
              {!field.nullable && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={field.name}
              value={value || ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className={commonClasses}
              required={!field.nullable}
              placeholder={`ID de ${field.relation?.entityType}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Relation vers: {field.relation?.entityType}
            </p>
          </div>
        );

      default:
        return (
          <div>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.displayName}
              {!field.nullable && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={field.name}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={commonClasses}
              required={!field.nullable}
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Modifier {metadata.displayName}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-white px-4 py-5 sm:p-6 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.fields.map((field) => (
                  <div key={field.name} className="col-span-1">
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
