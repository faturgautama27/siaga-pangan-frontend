export class LoadEws {
  static readonly type = '[EWS] Load';
  constructor(public tanggal: string, public wilayahId?: number | null) {}
}

export class LoadEwsSuccess {
  static readonly type = '[EWS] Load Success';
  constructor(public alerts: any[], public summary?: any) {}
}

export class EwsTick {
  static readonly type = '[EWS] Tick';
}
