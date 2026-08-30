import {
  Package, Wheat, Egg, Beef, Drumstick, Fish, Flame, Droplets, Layers, Candy, Sprout,
} from 'lucide-angular';

const ICON_MAP: [string, any][] = [
  ['beras', Wheat],
  ['telur', Egg],
  ['daging sapi', Beef],
  ['daging ayam', Drumstick],
  ['ikan', Fish],
  ['cabai', Flame],
  ['bawang', Layers],
  ['minyak', Droplets],
  ['gula', Candy],
  ['kedelai', Sprout],
];

/** Ikon tematik berdasarkan kata kunci nama komoditi. */
export function komoditiIcon(nama: string): any {
  const n = nama.toLowerCase();
  for (const [keyword, icon] of ICON_MAP) {
    if (n.includes(keyword)) return icon;
  }
  return Package;
}
