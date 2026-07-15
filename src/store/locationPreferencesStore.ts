import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DistrictLabelLocale } from '../utils/locationLabel'

interface LocationPreferencesState {
  districtLabelLocale: DistrictLabelLocale
  setDistrictLabelLocale: (locale: DistrictLabelLocale) => void
}

export const useLocationPreferencesStore = create<LocationPreferencesState>()(
  persist(
    (set) => ({
      districtLabelLocale: 'original',
      setDistrictLabelLocale: (districtLabelLocale) => set({ districtLabelLocale }),
    }),
    { name: 'maptrip-location-preferences' },
  ),
)
