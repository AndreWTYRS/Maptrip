import type { LocationTreeNode } from '../config/locationTree/types'

export type DistrictLabelLocale = 'original' | 'en'

export function getLocationLabel(
  node: LocationTreeNode,
  locale: DistrictLabelLocale,
): string {
  if (node.type !== 'district') return node.label

  if (locale === 'original') {
    return node.labelOriginal ?? node.label
  }

  return node.labelEn ?? node.label
}
