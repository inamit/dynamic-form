/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.service';
import type { EntityConfig } from '../types';
import { parseCoordinate, formatCoordinate } from '@dynamic-form/geo-utils';
import 'postal';
const postal = (window as any).postal;
import { CHANNEL_NAME, TOPICS } from "../utils/topic.js";
import type { Enums } from "@dynamic-form/shared-ui";

export function useEntityForm(
  entity: string | null,
  id?: string,
  initialCoordinateFormats?: Record<string, 'WGS84' | 'UTM'>,
  initialDefaultValues?: Record<string, any>,
  injectedPresetId?: number
) {
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [coordinateFormats, setCoordinateFormats] = useState<Record<string, 'WGS84' | 'UTM'>>(initialCoordinateFormats || {});
  const [schema, setSchema] = useState<any>(null);
  const [enums, setEnums] = useState<Enums>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [abilities, setAbilities] = useState({ canCreate: false, canEdit: false, canDelete: false, canView: false });
  const [error, setError] = useState<string | null>(null);

  const fetchConfigAndData = useCallback(async (currentEntity: string, currentId?: string) => {
    setLoading(true);
    setValidationErrors({});
    setError(null);
    try {
      const [configData, abilitiesData] = await Promise.all([
        ApiService.getConfig(currentEntity),
        ApiService.getAbilities(currentEntity)
      ]);
      setConfig(configData);
      setAbilities(abilitiesData);

      try {
        const schemaName = configData.schemaName || currentEntity;
        const schemaData = await ApiService.getSchema(schemaName);
        setSchema(schemaData);
      } catch (err) {
        console.error(`Failed to fetch schema for ${currentEntity}`, err);
        setSchema(null);
      }

      try {
        const enumsData = await ApiService.getEnums();
        setEnums(enumsData);
      } catch (err) {
        console.error(`Failed to fetch enums for ${currentEntity}`, err);
        setEnums({});
      }

      const defaultFormat = coordinateFormats._default || 'UTM';
      const formats: Record<string, 'WGS84' | 'UTM'> = { _default: defaultFormat };
      configData.fields.forEach((f: any) => {
        if (f.type === 'coordinate') {
          formats[f.name] = defaultFormat as 'WGS84' | 'UTM';
        }
      });
      setCoordinateFormats(prev => ({ ...prev, ...formats }));

      if (currentId) {
        const itemData = await ApiService.getDataById(currentEntity, currentId);
        const newData = { ...itemData };
        configData.fields.forEach((f: any) => {
          if (f.type === 'coordinate' && newData[f.name]) {
            const loc = newData[f.name];
            if (loc && typeof loc === 'object' && loc.latitude !== undefined && loc.longitude !== undefined) {
               newData[f.name] = formatCoordinate(loc.longitude, loc.latitude, formats[f.name] || 'UTM');
            }
          }
        });
        setFormData(newData);
      } else {
        let presetDefaultValues: Record<string, any> = {};
        const initialPresetId = injectedPresetId || configData.defaultPresetId;
        if (initialPresetId && configData.presets) {
            const p = configData.presets.find((p: any) => p.id === initialPresetId);
            if (p && p.defaultValues) {
                presetDefaultValues = p.defaultValues;
            }
        } else if (!initialPresetId && configData.presets && configData.presets.length > 0) {
             const p = configData.presets[0];
             if (p && p.defaultValues) {
                 presetDefaultValues = p.defaultValues;
             }
        }

        const mergedDefaults = { ...presetDefaultValues, ...initialDefaultValues };

        const initData: Record<string, any> = {};
        configData.fields.forEach((f: any) => {
          if (mergedDefaults[f.name] !== undefined) {
            if (f.type === 'coordinate' && typeof mergedDefaults[f.name] === 'object') {
              const loc = mergedDefaults[f.name];
              initData[f.name] = formatCoordinate(loc.longitude, loc.latitude, formats[f.name] || 'UTM');
            } else {
              initData[f.name] = mergedDefaults[f.name];
            }
          } else if (f.type === 'enum') {
            initData[f.name] = '';
          } else if (f.type === 'list') {
            initData[f.name] = [];
          } else {
            initData[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
          }
        });
        setFormData(initData);
      }
    } catch (err: any) {
      console.error('Failed to load form data', err);
      setError(err.message || 'Failed to load form data');
      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.FORM_LOAD_ERROR,
        data: { entity: currentEntity, error: err }
      });
    } finally {
      setLoading(false);
    }
  }, [coordinateFormats._default, initialDefaultValues, injectedPresetId]);

  useEffect(() => {
    if (entity) {
      fetchConfigAndData(entity, id);
    } else {
      setLoading(false);
    }
  }, [entity, id, fetchConfigAndData]);

  const validateField = (name: string, value: any, currentSchema: any) => {
    if (!currentSchema || !currentSchema.properties || !currentSchema.properties[name]) return '';

    const rules = currentSchema.properties[name];
    const isRequired = currentSchema.required?.includes(name);

    if (isRequired && (value === undefined || value === null || value === '')) {
      return 'This field is required';
    }

    if (value === undefined || value === null || value === '') return '';

    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength}`;
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength}`;
      }
      if (rules.pattern !== undefined) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          return `Does not match the required pattern`;
        }
      }
    } else if (rules.type === 'number' && typeof value === 'number') {
      if (rules.minimum !== undefined && value < rules.minimum) {
        return `Minimum value is ${rules.minimum}`;
      }
      if (rules.maximum !== undefined && value > rules.maximum) {
        return `Maximum value is ${rules.maximum}`;
      }
    }
    return '';
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!entity) return;
    setValidationErrors({});
    let isValid = true;
    const errors: Record<string, string> = {};

    if (schema && config) {
      config.fields.forEach(f => {
         const error = validateField(f.name, formData[f.name], schema);
         if (error) {
             errors[f.name] = error;
             isValid = false;
         }
      });
    }

    if (!isValid) {
        setValidationErrors(errors);
        return;
    }

    try {
      const payload = { ...formData };

      if (config) {
        config.fields.forEach(f => {
          if (f.type === 'coordinate' && payload[f.name]) {
             const parsed = parseCoordinate(payload[f.name]);
             if (parsed) {
                payload[f.name] = { longitude: parsed[0], latitude: parsed[1] };
             } else {
                delete payload[f.name];
             }
          }
        });
      }

      let response;
      if (id) {
        response = await ApiService.updateData(entity, id, payload);
      } else {
        response = await ApiService.createData(entity, payload);
      }

      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.ENTITY_SAVED,
        data: { entity, data: response }
      });
      return true;
    } catch (err) {
      console.error('Save failed', err);
      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.ENTITY_SAVE_ERROR,
        data: { entity, error: err }
      });
      return false;
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCoordinateFormat = (field: string, format: 'WGS84' | 'UTM') => {
    setCoordinateFormats(prev => ({ ...prev, [field]: format }));
  };

  return {
    config,
    formData,
    setFormData: updateFormData,
    loading,
    error,
    abilities,
    coordinateFormats,
    updateCoordinateFormat,
    schema,
    enums,
    validationErrors,
    handleSubmit,
    validateField
  };
}
