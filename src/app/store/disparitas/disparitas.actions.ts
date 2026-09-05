/**
 * NGXS Actions untuk Disparitas Harga
 */

// ============================================================================
// DISPARITAS TEMPORAL
// ============================================================================

export class LoadDisparitasTemporal {
  static readonly type = '[Disparitas] Load Temporal';
  constructor(
    public payload: {
      tahun: number;
      wilayah_id?: number;
      komoditi_id?: number;
      status?: 'stabil' | 'fluktuatif';
      calculate?: boolean;
    }
  ) {}
}

export class LoadDisparitasTemporalSuccess {
  static readonly type = '[Disparitas] Load Temporal Success';
  constructor(public payload: any[]) {}
}

export class LoadDisparitasTemporalFailure {
  static readonly type = '[Disparitas] Load Temporal Failure';
  constructor(public error: string) {}
}

// ============================================================================
// DISPARITAS SPATIAL
// ============================================================================

export class LoadDisparitasSpatial {
  static readonly type = '[Disparitas] Load Spatial';
  constructor(
    public payload: {
      tahun: number;
      bulan?: number;
      komoditi_id?: number;
      status?: 'wajar' | 'tinggi';
      calculate?: boolean;
    }
  ) {}
}

export class LoadDisparitasSpatialSuccess {
  static readonly type = '[Disparitas] Load Spatial Success';
  constructor(public payload: any[]) {}
}

export class LoadDisparitasSpatialFailure {
  static readonly type = '[Disparitas] Load Spatial Failure';
  constructor(public error: string) {}
}

// ============================================================================
// DISPARITAS SPATIAL KUMULATIF
// ============================================================================

export class LoadDisparitasSpatialKumulatif {
  static readonly type = '[Disparitas] Load Spatial Kumulatif';
  constructor(
    public payload: {
      tahun: number;
      komoditi_id: number;
    }
  ) {}
}

export class LoadDisparitasSpatialKumulatifSuccess {
  static readonly type = '[Disparitas] Load Spatial Kumulatif Success';
  constructor(public payload: any[]) {}
}

export class LoadDisparitasSpatialKumulatifFailure {
  static readonly type = '[Disparitas] Load Spatial Kumulatif Failure';
  constructor(public error: string) {}
}

// ============================================================================
// SUMMARY
// ============================================================================

export class LoadDisparitasSummary {
  static readonly type = '[Disparitas] Load Summary';
  constructor(public tahun: number) {}
}

export class LoadDisparitasSummarySuccess {
  static readonly type = '[Disparitas] Load Summary Success';
  constructor(public payload: any) {}
}

export class LoadDisparitasSummaryFailure {
  static readonly type = '[Disparitas] Load Summary Failure';
  constructor(public error: string) {}
}

// ============================================================================
// RANKING WILAYAH
// ============================================================================

export class LoadRankingWilayah {
  static readonly type = '[Disparitas] Load Ranking Wilayah';
  constructor(
    public payload: {
      komoditi_id: number;
      bulan: number;
      tahun: number;
      order?: 'asc' | 'desc';
      limit?: number;
    }
  ) {}
}

export class LoadRankingWilayahSuccess {
  static readonly type = '[Disparitas] Load Ranking Wilayah Success';
  constructor(public payload: any[]) {}
}

export class LoadRankingWilayahFailure {
  static readonly type = '[Disparitas] Load Ranking Wilayah Failure';
  constructor(public error: string) {}
}

// ============================================================================
// CLEAR & RESET
// ============================================================================

export class ClearDisparitasData {
  static readonly type = '[Disparitas] Clear Data';
}

// ============================================================================
// CALCULATE (Re-compute disparitas dari price_history)
// ============================================================================

export class CalculateDisparitas {
  static readonly type = '[Disparitas] Calculate';
  constructor(public tahun: number) {}
}

export class CalculateDisparitasSuccess {
  static readonly type = '[Disparitas] Calculate Success';
  constructor(public payload: any) {}
}

export class CalculateDisparitasFailure {
  static readonly type = '[Disparitas] Calculate Failure';
  constructor(public error: string) {}
}
