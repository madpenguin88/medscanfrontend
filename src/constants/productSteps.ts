import { Upload, CheckCircle2, Brain, type LucideIcon } from 'lucide-react';

export interface ProductStep {
  step: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  numColor: string;
  borderColor: string;
  title: string;
  desc: string;
}

export const PRODUCT_STEPS: ProductStep[] = [
  {
    step: '01',
    icon: Upload,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    numColor: 'text-blue-400/20 dark:text-blue-400/15',
    borderColor: 'border-blue-100 dark:border-blue-900/40',
    title: 'Încarcă PDF-ul',
    desc: 'Primești un PDF cu analizele de la laborator. Îl încarci în MedScan cu drag & drop sau prin selecție.',
  },
  {
    step: '02',
    icon: CheckCircle2,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    numColor: 'text-indigo-400/20 dark:text-indigo-400/15',
    borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    title: 'Verifică și salvează',
    desc: 'AI-ul extrage automat valorile numerice. Verifici că sunt corecte, modifici dacă e nevoie, apoi salvezi.',
  },
  {
    step: '03',
    icon: Brain,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    numColor: 'text-violet-400/20 dark:text-violet-400/15',
    borderColor: 'border-violet-100 dark:border-violet-900/40',
    title: 'Generează raport AI',
    desc: 'Revii pe Dashboard și apeși „Generează Raport AI". MedScan analizează toate valorile și creează un rezumat personalizat.',
  },
];
