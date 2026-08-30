import {
  Package, Wheat, Egg, Beef, Drumstick, Fish, Flame, Droplets, Layers, Candy, Sprout,
} from 'lucide-angular';

// Image path mapping untuk komoditas dengan gambar real dari folder public
const IMAGE_MAP: Record<string, string> = {
  'beras': 'beras_medium.png',
  'bawang merah': 'bawang_merah.png',
  'bawang putih': 'bawang_putih.png',
  'cabai merah': 'cabai_merah.png',
  'cabai rawit': 'cabai_rawit.png',
  'daging ayam': 'daging_ayam.png',
  'daging sapi': 'daging_sapi.png',
  'telur': 'telur.png',
  'minyak': 'minyakita.png',
  'gula': 'gula_pasir.png',
  'tomat': 'tomat.png',
  'tepung': 'tepung_terigu.png',
  'ikan': 'ikan.png',
  'kedelai': 'kedelai.png'
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

/** Get image path untuk komoditi, return path dari folder public */
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

/** Ikon fallback lucide berdasarkan kata kunci nama komoditi */
export function komoditiIcon(nama: string): any {
  const n = nama.toLowerCase();
  for (const [keyword, icon] of ICON_MAP) {
    if (n.includes(keyword)) return icon;
  }
  return Package;
}


