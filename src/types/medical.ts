export interface MedicalAnalysis {
  id: string;
  name: string;
  value: number | null;
  textValue?: string;
  status?: string;
  unit: string;
  referenceRange?: { min?: number; max?: number };
  referenceNote?: string;
  collectionDate?: string;
  laboratory?: string;
  source: 'manual' | 'pdf' | 'image';
}

export interface MedicalResultDto {
  id: number;
  name: string;
  value: number | null;
  textValue: string | null;
  unit: string;
  minRef: number | null;
  maxRef: number | null;
  status: string;
  referenceNote?: string;
}

export interface MedicalRecordDto {
  id: number;
  userId: number;
  collectionDate: string | null;
  laboratory: string | null;
  pdfFileName: string | null;
  createdAt: string;
  results: MedicalResultDto[];
}

export interface MedicalRecordSummaryDto {
  id: number;
  userId: number;
  collectionDate: string | null;
  laboratory: string | null;
  pdfFileName: string | null;
  createdAt: string;
  resultCount: number;
}

// ── AI Health Report types ────────────────────────────────────────────────────

export type StareGenerala = 'normal' | 'atentie' | 'monitorizare' | 'critica';
export type AnalysisStatus = 'normal' | 'crescut' | 'scazut' | 'anormal';
export type AnalysisTrend = 'stabil' | 'crescator' | 'descrescator' | 'insuficient_date';
export type TestUrgenta = 'urgent' | 'recomandat' | 'optional';

export interface AnalysisDetailDto {
  denumire: string;
  valoareCurenta: number | null;
  unitate: string;
  status: AnalysisStatus;
  trend: AnalysisTrend | null;
  interpretareText: string;
  cauzePosibile: string[];
  riscuri: string[];
  recomandariSpecifice: string[];
}

export interface AnalysisGroupDto {
  categorie: string;
  analize: AnalysisDetailDto[];
}

export interface RecommendedTestDto {
  denumire: string;
  motiv: string;
  urgenta: TestUrgenta;
}

export interface AiHealthReportDto {
  id: number;
  generatedAt: string;
  recordCount: number;
  stareGenerala: StareGenerala;
  rezumat: string;
  interpretareAnalize: AnalysisGroupDto[];
  bunePractici: string[];
  analizeRecomandate: RecommendedTestDto[];
  notaMedicala: string;
}
