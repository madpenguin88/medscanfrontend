import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { MedicalAnalysis } from '../types/medical';
import { api } from '../api';

export const useAnalysisParser = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsePDF = async (file: File): Promise<MedicalAnalysis[]> => {
    setIsParsing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/Analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const mappedResults: MedicalAnalysis[] = response.data.results.map((r: any) => {
        const rawValue = r.value ?? r.Value;
        const rawMin = r.minRef ?? r.MinRef;
        const rawMax = r.maxRef ?? r.MaxRef;
        const rawTextValue = r.textValue ?? r.TextValue;
        const parsedNum = rawValue != null ? parseFloat(rawValue) : NaN;
        return {
          id: uuidv4(),
          name: r.name ?? r.Name ?? 'Unknown',
          value: !isNaN(parsedNum) ? parsedNum : null,
          textValue: (rawTextValue && String(rawTextValue).trim()) ? String(rawTextValue).trim() : undefined,
          status: r.status ?? r.Status ?? undefined,
          unit: r.unit ?? r.Unit ?? '',
          referenceRange: (rawMin != null || rawMax != null) ? {
            min: rawMin != null ? parseFloat(rawMin) : undefined,
            max: rawMax != null ? parseFloat(rawMax) : undefined,
          } : undefined,
          referenceNote: r.referenceNote ?? r.ReferenceNote ?? undefined,
          collectionDate: (response.data.collectionDate || response.data.CollectionDate) ?? undefined,
          laboratory: (response.data.laboratory || response.data.Laboratory) ?? undefined,
          source: 'pdf' as const,
        };
      });

      return mappedResults;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
         setError('Eroare la procesarea PDF: ' + ((err as any).response?.data?.message || (err as any).message));
      } else {
         setError('Eroare generală la procesarea PDF.');
      }
      return [];
    } finally {
      setIsParsing(false);
    }
  };

  const parseImage = async (file: File): Promise<MedicalAnalysis[]> => {
    setIsParsing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // We explicitly override the global 'application/json' Content-Type
      // by setting it to 'multipart/form-data'. Axios > 1.x handles boundary correctly.
      const response = await api.post('/Analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const mappedResults: MedicalAnalysis[] = response.data.results.map((r: any) => ({
        id: uuidv4(),
        name: r.Name || 'Unknown',
        value: r.Value != null ? parseFloat(r.Value) : null,
        textValue: r.TextValue || undefined,
        status: r.Status ?? undefined,
        unit: r.Unit || '',
        referenceRange: (r.MinRef != null || r.MaxRef != null) ? {
          min: r.MinRef != null ? r.MinRef : undefined,
          max: r.MaxRef != null ? r.MaxRef : undefined,
        } : undefined,
        collectionDate: (response.data.collectionDate || response.data.CollectionDate) ?? undefined,
        laboratory: (response.data.laboratory || response.data.Laboratory) ?? undefined,
        source: 'image',
      }));

      return mappedResults;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
         setError('Eroare la procesarea imaginii: ' + ((err as any).response?.data?.message || (err as any).message));
      } else {
         setError('Eroare generală la procesarea imaginii.');
      }
      return [];
    } finally {
      setIsParsing(false);
    }
  };

  return { parsePDF, parseImage, isParsing, error };
};
