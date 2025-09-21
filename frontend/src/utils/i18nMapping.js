// Central mapping util for normalizing DB values (specialties, cities) to i18n keys
// Keep mappings small and explicit; add new DB variants here as they appear.
const removeDiacritics = (str) => {
  if (!str) return '';
  // Normalize and remove combining diacritical marks
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const specialtyMap = {
  // French specialties (common database values)
  'droit civil': 'droitCivil', 'droitcivil': 'droitCivil', 'civil': 'droitCivil',
  'droit penal': 'droitPenal', 'droit pénal': 'droitPenal', 'droitpenal': 'droitPenal', 'penal': 'droitPenal', 'pénal': 'droitPenal',
  'droit commercial': 'droitCommercial', 'droitcommercial': 'droitCommercial', 'commercial': 'droitCommercial',
  'droit du travail': 'droitTravail', 'droit travail': 'droitTravail', 'droittravail': 'droitTravail', 'travail': 'droitTravail',
  'droit fiscal': 'droitFiscal', 'droitfiscal': 'droitFiscal', 'fiscal': 'droitFiscal',
  'droit immobilier': 'droitImmobilier', 'droitimmobilier': 'droitImmobilier', 'immobilier': 'droitImmobilier',
  
  // English specialties
  'civil law': 'civilLaw', 'civillaw': 'civilLaw',
  'criminal law': 'criminalLaw', 'criminallaw': 'criminalLaw',
  'corporate law': 'corporateLaw', 'corporatelaw': 'corporateLaw',
  'family law': 'familyLaw', 'familylaw': 'familyLaw',
  'intellectual property': 'intellectualProperty', 'intellectualproperty': 'intellectualProperty',
  'labor law': 'laborLaw', 'laborlaw': 'laborLaw',
  'tax law': 'taxLaw', 'taxlaw': 'taxLaw',
  'real estate law': 'realEstateLaw', 'realestatelaw': 'realEstateLaw',
  
  // Alternative spellings and variations
  'business law': 'corporateLaw', 'corporate': 'corporateLaw',
  'employment law': 'laborLaw', 'employment': 'laborLaw',
  'property law': 'realEstateLaw', 'property': 'realEstateLaw',
  'business & corporate law': 'corporateLaw',
  'property & real estate': 'realEstateLaw',
  'personal injury': 'personalInjury',
  'administrative law': 'administrativeLaw',
  'contract law': 'contractLaw',
  'immigration law': 'immigrationLaw'
};

const cityMap = {
  'ariana':'ariana','أريانة':'ariana','ariyana':'ariana',
  'beja':'beja','béja':'beja','باجة':'beja',
  'ben arous':'benArous','بن عروس':'benArous','benarous':'benArous',
  'bizerte':'bizerte','بنزرت':'bizerte','banzert':'bizerte',
  'gabes':'gabes','قابس':'gabes','gafsa':'gafsa','قفصة':'gafsa',
  'jendouba':'jendouba','جندوبة':'jendouba','kairouan':'kairouan','القيروان':'kairouan',
  'kasserine':'kasserine','القصرين':'kasserine','kebili':'kebili','قبلي':'kebili',
  'kef':'kef','الكاف':'kef','mahdia':'mahdia','المهدية':'mahdia',
  'manouba':'manouba','منوبة':'manouba','medenine':'medenine','مدنين':'medenine',
  'monastir':'monastir','المنستير':'monastir','nabeul':'nabeul','نابل':'nabeul',
  'sfax':'sfax','صفاقس':'sfax','sidi bouzid':'sidiBouzid','سيدي بوزيد':'sidiBouzid',
  'siliana':'siliana','سليانة':'siliana','sousse':'sousse','سوسة':'sousse',
  'tataouine':'tataouine','تطاوين':'tataouine','tozeur':'tozeur','توزر':'tozeur',
  'tunis':'tunis','تونس':'tunis','zaghouan':'zaghouan','زغوان':'zaghouan'
};

export function mapToKey(value, type) {
  if (!value) return '';
  const normalized = removeDiacritics(String(value)).trim();
  if (type === 'specialty') {
    return specialtyMap[normalized] || normalized.replace(/\s+/g, '') || '';
  }
  if (type === 'city') {
    return cityMap[normalized] || normalized.replace(/\s+/g, '') || '';
  }
  return normalized.replace(/\s+/g, '');
}

export default mapToKey;
