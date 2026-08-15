export class LoadEws {
  static readonly type = '[EWS] Load';
  constructor(public tanggal: string) {}
}

export class LoadEwsSuccess {
  static readonly type = '[EWS] Load Success';
  constructor(public alerts: any[]) {}
}

export class EwsTick {
  static readonly type = '[EWS] Tick';
}
