import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { LoadMaster, LoadMasterSuccess } from './master.actions';

export interface Wilayah {
  id: number;
  kode_kemendagri: string;
  nama: string;
  is_ihk: number;
}

export interface Komoditi {
  id: number;
  nama: string;
  kategori: string | null;
  satuan: string;
}

export interface MasterStateModel {
  wilayah: Wilayah[];
  komoditi: Komoditi[];
  isLoaded: boolean;
}

@State<MasterStateModel>({
  name: 'master',
  defaults: { wilayah: [], komoditi: [], isLoaded: false },
})
@Injectable()
export class MasterState {
  private api = inject(ApiService);

  @Selector()
  static wilayah(state: MasterStateModel): Wilayah[] {
    return state.wilayah;
  }

  @Selector()
  static komoditi(state: MasterStateModel): Komoditi[] {
    return state.komoditi;
  }

  @Selector()
  static wilayahIhk(state: MasterStateModel): Wilayah[] {
    return state.wilayah.filter((w) => w.is_ihk === 1);
  }

  @Selector()
  static isLoaded(state: MasterStateModel): boolean {
    return state.isLoaded;
  }

  @Action(LoadMaster)
  loadMaster(ctx: StateContext<MasterStateModel>) {
    if (ctx.getState().isLoaded) return;

    return forkJoin({
      wilayah: this.api.get<any>('/wilayah'),
      komoditi: this.api.get<any>('/komoditi'),
    }).pipe(
      tap(({ wilayah, komoditi }) => {
        ctx.dispatch(
          new LoadMasterSuccess({
            wilayah: wilayah.data ?? [],
            komoditi: komoditi.data ?? [],
          })
        );
      })
    );
  }

  @Action(LoadMasterSuccess)
  loadMasterSuccess(ctx: StateContext<MasterStateModel>, action: LoadMasterSuccess) {
    ctx.patchState({
      wilayah: action.payload.wilayah,
      komoditi: action.payload.komoditi,
      isLoaded: true,
    });
  }
}
