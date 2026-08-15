import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { LoadEws, LoadEwsSuccess, EwsTick } from './ews.actions';

export interface EwsAlert {
  wilayah_id: number;
  wilayah: string;
  komoditi_id: number;
  komoditi: string;
  harga: number;
  rata_provinsi: number;
  deviasi_persen: number;
  threshold_persen: number;
  pic: string | null;
  koordinator: string | null;
  status_laporan: string;
}

export interface EwsStateModel {
  alerts: EwsAlert[];
  tanggal: string | null;
  countdown: string;
  isLoading: boolean;
}

@State<EwsStateModel>({
  name: 'ews',
  defaults: { alerts: [], tanggal: null, countdown: '--:--:--', isLoading: false },
})
@Injectable()
export class EwsState {
  private api = inject(ApiService);

  @Selector()
  static alerts(state: EwsStateModel): EwsAlert[] {
    return state.alerts;
  }

  @Selector()
  static countdown(state: EwsStateModel): string {
    return state.countdown;
  }

  @Selector()
  static isLoading(state: EwsStateModel): boolean {
    return state.isLoading;
  }

  @Action(LoadEws)
  loadEws(ctx: StateContext<EwsStateModel>, action: LoadEws) {
    ctx.patchState({ isLoading: true, tanggal: action.tanggal });
    return this.api.get<any>(`/ews?tanggal=${action.tanggal}`).pipe(
      tap((res) => ctx.dispatch(new LoadEwsSuccess(res.data ?? [])))
    );
  }

  @Action(LoadEwsSuccess)
  loadEwsSuccess(ctx: StateContext<EwsStateModel>, action: LoadEwsSuccess) {
    ctx.patchState({ alerts: action.alerts, isLoading: false });
  }

  @Action(EwsTick)
  tick(ctx: StateContext<EwsStateModel>) {
    const now = new Date();
    const target = new Date();
    target.setHours(17, 0, 0, 0);

    // Jika sudah lewat 17:00, target besok
    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

    ctx.patchState({ countdown: `${h}:${m}:${s}` });
  }
}
