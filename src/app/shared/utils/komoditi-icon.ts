import {
  Package, Wheat, Egg, Beef, Drumstick, Fish, Flame, Droplets, Layers, Candy, Sprout,
} from 'lucide-angular';

// Image path mapping for commodities with real images
const IMAGE_MAP: Record<string, string> = {
  'bawang merah': 'assets/komoditi/bawang-merah.png',
  'bawang putih': 'assets/komoditi/bawang-putih.png',
  'cabai merah': 'assets/komoditi/cabai-merah.png',
  'cabai rawit': 'assets/komoditi/cabai-rawit.png',
  'daging ayam': 'assets/komoditi/daging-ayam.png',
  'daging sapi': 'assets/komoditi/daging-sapi.png',
  'minyak goreng': 'assets/komoditi/minyak-goreng.png',
  'telur ayam': 'assets/komoditi/telur-ayam.png',
  'tomat': 'assets/komoditi/tomat.png',
};

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

/** Get image path for commodity if available, otherwise return null */
export function komoditiImage(nama: string): string | null {
  const n = nama.toLowerCase().trim();
  
  // Direct exact match
  if (IMAGE_MAP[n]) {
    return IMAGE_MAP[n];
  }
  
  // Partial match
  for (const [key, path] of Object.entries(IMAGE_MAP)) {
    if (n.includes(key) || key.includes(n)) {
      return path;
    }
  }
  
  return null;
}

/** Ikon tematik berdasarkan kata kunci nama komoditi. */
export function komoditiIcon(nama: string): any {
  const n = nama.toLowerCase();
  for (const [keyword, icon] of ICON_MAP) {
    if (n.includes(keyword)) return icon;
  }
  return Package;
}

