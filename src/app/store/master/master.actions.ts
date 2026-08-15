export class LoadMaster {
  static readonly type = '[Master] Load';
}

export class LoadMasterSuccess {
  static readonly type = '[Master] Load Success';
  constructor(public payload: { wilayah: any[]; komoditi: any[] }) {}
}
