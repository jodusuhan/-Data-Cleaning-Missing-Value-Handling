
export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical';
  missingCount: number;
  totalCount: number;
  mean?: number;
  median?: number;
  mode?: string;
}

export interface DatasetStats {
  totalRows: number;
  totalCols: number;
  columns: DataColumn[];
}

export interface InterviewQA {
  question: string;
  answer: string;
}

export enum ProcessingStep {
  UPLOAD = 'UPLOAD',
  CLEANING = 'CLEANING',
  REVIEW = 'REVIEW',
  INTERVIEW_PREP = 'INTERVIEW_PREP'
}
