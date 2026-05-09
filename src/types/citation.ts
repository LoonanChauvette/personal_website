export interface CSLAuthor {
  family?: string;
  given?: string;
  literal?: string;
}

export interface CSLData {
  type: string;
  title: string;
  author: CSLAuthor[];
  issued?: { 'date-parts': number[][] };
  'container-title'?: string;
  volume?: string;
  issue?: string;
  page?: string;
  DOI?: string;
  URL?: string;
}

export interface CitationResponse {
  id: string;
  url: string;
  source: string;
  confidence: number;
  csl: CSLData;
  formatted: {
    apa: string;
    mla: string;
    chicago: string;
    bibtex: string;
  };
  cached: boolean;
  extracted_at: string;
}

export interface CitationError {
  error: string;
  message: string;
  doi?: string;
}
