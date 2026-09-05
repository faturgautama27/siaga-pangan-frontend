import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  LoadDisparitasTemporal,
  LoadDisparitasTemporalSuccess,
  LoadDisparitasTemporalFailure,
  LoadDisparitasSpatial,
  LoadDisparitasSpatialSuccess,
  LoadDisparitasSpatialFailure,
  LoadDisparitasSpatialKumulatif,
  LoadDisparitasSpatialKumulatifSuccess,
  LoadDisparitasSpatialKumulatifFailure,
  LoadDisparitasSummary,
  LoadDisparitasSummarySuccess,
  LoadDisparitasSummaryFailure,
  LoadRankingWilayah,
  LoadRankingWilayahSuccess,
  LoadRankingWilayahFailure,
  ClearDisparitasData,
  CalculateDisparitas,
  CalculateDisparitasFailure,
  CalculateDisparitasSuccess,
} from './disparitas.actions';

export interface DisparitasStateModel {
  temporal: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  spatial: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  spatialKumulatif: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  summary: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  rankingWilayah: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
}

const defaults: DisparitasStateModel = {
  temporal: {
    data: [],
    loading: false,
    error: null,
  },
  spatial: {
    data: [],
    loading: false,
    error: null,
  },
  spatialKumulatif: {
    data: [],
    loading: false,
    error: null,
  },
  summary: {
    data: null,
    loading: false,
    error: null,
  },
  rankingWilayah: {
    data: [],
    loading: false,
    error: null,
  },
};

@State<DisparitasStateModel>({
  name: 'disparitas',
  defaults,
})
@Injectable()
export class DisparitasState {
  private api = inject(ApiService);

  // ========================================================================
  // SELECTORS
  // ========================================================================

  @Selector()
  static temporal(state: DisparitasStateModel) {
    return state.temporal;
  }

  @Selector()
  static spatial(state: DisparitasStateModel) {
    return state.spatial;
  }

  @Selector()
  static spatialKumulatif(state: DisparitasStateModel) {
    return state.spatialKumulatif;
  }

  @Selector()
  static summary(state: DisparitasStateModel) {
    return state.summary;
  }

  @Selector()
  static rankingWilayah(state: DisparitasStateModel) {
    return state.rankingWilayah;
  }

  // ========================================================================
  // ACTIONS: TEMPORAL
  // ========================================================================

  @Action(LoadDisparitasTemporal)
  loadTemporal(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasTemporal) {
    ctx.patchState({
      temporal: { ...ctx.getState().temporal, loading: true, error: null },
    });

    const params: Record<string, any> = { tahun: action.payload.tahun };
    if (action.payload.wilayah_id) params['wilayah_id'] = action.payload.wilayah_id;
    if (action.payload.komoditi_id) params['komoditi_id'] = action.payload.komoditi_id;
    if (action.payload.status) params['status'] = action.payload.status;
    if (action.payload.calculate) params['calculate'] = '1';

    return this.api.get<any>('/disparitas/temporal', params).pipe(
      tap((res) => {
        ctx.dispatch(new LoadDisparitasTemporalSuccess(res.data || []));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal memuat data disparitas temporal';
        ctx.dispatch(new LoadDisparitasTemporalFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(LoadDisparitasTemporalSuccess)
  loadTemporalSuccess(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasTemporalSuccess) {
    ctx.patchState({
      temporal: {
        data: action.payload,
        loading: false,
        error: null,
      },
    });
  }

  @Action(LoadDisparitasTemporalFailure)
  loadTemporalFailure(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasTemporalFailure) {
    ctx.patchState({
      temporal: {
        ...ctx.getState().temporal,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // ACTIONS: SPATIAL
  // ========================================================================

  @Action(LoadDisparitasSpatial)
  loadSpatial(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSpatial) {
    ctx.patchState({
      spatial: { ...ctx.getState().spatial, loading: true, error: null },
    });

    const params: Record<string, any> = { tahun: action.payload.tahun };
    if (action.payload.bulan) params['bulan'] = action.payload.bulan;
    if (action.payload.komoditi_id) params['komoditi_id'] = action.payload.komoditi_id;
    if (action.payload.status) params['status'] = action.payload.status;
    if (action.payload.calculate) params['calculate'] = '1';

    return this.api.get<any>('/disparitas/spatial', params).pipe(
      tap((res) => {
        ctx.dispatch(new LoadDisparitasSpatialSuccess(res.data || []));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal memuat data disparitas spatial';
        ctx.dispatch(new LoadDisparitasSpatialFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(LoadDisparitasSpatialSuccess)
  loadSpatialSuccess(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSpatialSuccess) {
    ctx.patchState({
      spatial: {
        data: action.payload,
        loading: false,
        error: null,
      },
    });
  }

  @Action(LoadDisparitasSpatialFailure)
  loadSpatialFailure(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSpatialFailure) {
    ctx.patchState({
      spatial: {
        ...ctx.getState().spatial,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // ACTIONS: SPATIAL KUMULATIF
  // ========================================================================

  @Action(LoadDisparitasSpatialKumulatif)
  loadSpatialKumulatif(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSpatialKumulatif) {
    ctx.patchState({
      spatialKumulatif: { ...ctx.getState().spatialKumulatif, loading: true, error: null },
    });

    const params = {
      tahun: action.payload.tahun,
      komoditi_id: action.payload.komoditi_id,
    };

    return this.api.get<any>('/disparitas/spatial/kumulatif', params).pipe(
      tap((res) => {
        ctx.dispatch(new LoadDisparitasSpatialKumulatifSuccess(res.data || []));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal memuat data disparitas kumulatif';
        ctx.dispatch(new LoadDisparitasSpatialKumulatifFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(LoadDisparitasSpatialKumulatifSuccess)
  loadSpatialKumulatifSuccess(
    ctx: StateContext<DisparitasStateModel>,
    action: LoadDisparitasSpatialKumulatifSuccess
  ) {
    ctx.patchState({
      spatialKumulatif: {
        data: action.payload,
        loading: false,
        error: null,
      },
    });
  }

  @Action(LoadDisparitasSpatialKumulatifFailure)
  loadSpatialKumulatifFailure(
    ctx: StateContext<DisparitasStateModel>,
    action: LoadDisparitasSpatialKumulatifFailure
  ) {
    ctx.patchState({
      spatialKumulatif: {
        ...ctx.getState().spatialKumulatif,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // ACTIONS: SUMMARY
  // ========================================================================

  @Action(LoadDisparitasSummary)
  loadSummary(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSummary) {
    ctx.patchState({
      summary: { ...ctx.getState().summary, loading: true, error: null },
    });

    return this.api.get<any>('/disparitas/summary', { tahun: action.tahun }).pipe(
      tap((res) => {
        ctx.dispatch(new LoadDisparitasSummarySuccess(res.data || null));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal memuat summary disparitas';
        ctx.dispatch(new LoadDisparitasSummaryFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(LoadDisparitasSummarySuccess)
  loadSummarySuccess(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSummarySuccess) {
    ctx.patchState({
      summary: {
        data: action.payload,
        loading: false,
        error: null,
      },
    });
  }

  @Action(LoadDisparitasSummaryFailure)
  loadSummaryFailure(ctx: StateContext<DisparitasStateModel>, action: LoadDisparitasSummaryFailure) {
    ctx.patchState({
      summary: {
        ...ctx.getState().summary,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // ACTIONS: RANKING WILAYAH
  // ========================================================================

  @Action(LoadRankingWilayah)
  loadRankingWilayah(ctx: StateContext<DisparitasStateModel>, action: LoadRankingWilayah) {
    ctx.patchState({
      rankingWilayah: { ...ctx.getState().rankingWilayah, loading: true, error: null },
    });

    const params: Record<string, any> = {
      komoditi_id: action.payload.komoditi_id,
      bulan: action.payload.bulan,
      tahun: action.payload.tahun,
    };
    if (action.payload.order) params['order'] = action.payload.order;
    if (action.payload.limit) params['limit'] = action.payload.limit;

    return this.api.get<any>('/disparitas/ranking-wilayah', params).pipe(
      tap((res) => {
        ctx.dispatch(new LoadRankingWilayahSuccess(res.data || []));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal memuat ranking wilayah';
        ctx.dispatch(new LoadRankingWilayahFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(LoadRankingWilayahSuccess)
  loadRankingWilayahSuccess(ctx: StateContext<DisparitasStateModel>, action: LoadRankingWilayahSuccess) {
    ctx.patchState({
      rankingWilayah: {
        data: action.payload,
        loading: false,
        error: null,
      },
    });
  }

  @Action(LoadRankingWilayahFailure)
  loadRankingWilayahFailure(ctx: StateContext<DisparitasStateModel>, action: LoadRankingWilayahFailure) {
    ctx.patchState({
      rankingWilayah: {
        ...ctx.getState().rankingWilayah,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // CALCULATE (Re-compute disparitas)
  // ========================================================================

  @Action(CalculateDisparitas)
  calculateDisparitas(ctx: StateContext<DisparitasStateModel>, action: CalculateDisparitas) {
    ctx.patchState({
      summary: { ...ctx.getState().summary, loading: true, error: null },
    });

    return this.api.post<any>('/disparitas/calculate', { tahun: action.tahun }).pipe(
      tap((res) => {
        // Show info message if no data calculated
        const message = res.meta?.message || 'Perhitungan disparitas berhasil';
        console.log(message);
        
        ctx.dispatch(new CalculateDisparitasSuccess(res.data || null));
        // Reload summary setelah calculate
        ctx.dispatch(new LoadDisparitasSummary(action.tahun));
      }),
      catchError((err) => {
        const errorMsg = err.error?.error?.message || 'Gagal menghitung disparitas';
        ctx.dispatch(new CalculateDisparitasFailure(errorMsg));
        return throwError(() => err);
      })
    );
  }

  @Action(CalculateDisparitasSuccess)
  calculateDisparitasSuccess(ctx: StateContext<DisparitasStateModel>, action: CalculateDisparitasSuccess) {
    // Success handled by LoadDisparitasSummary dispatch
  }

  @Action(CalculateDisparitasFailure)
  calculateDisparitasFailure(ctx: StateContext<DisparitasStateModel>, action: CalculateDisparitasFailure) {
    ctx.patchState({
      summary: {
        ...ctx.getState().summary,
        loading: false,
        error: action.error,
      },
    });
  }

  // ========================================================================
  // CLEAR
  // ========================================================================

  @Action(ClearDisparitasData)
  clearData(ctx: StateContext<DisparitasStateModel>) {
    ctx.setState(defaults);
  }
}
