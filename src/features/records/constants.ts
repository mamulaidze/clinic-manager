export const MATERIAL_FIELDS = [
  { key: "keramika", labelKey: "materialKeramika" },
  { key: "tsirkoni", labelKey: "materialTsirkoni" },
  { key: "balka", labelKey: "materialBalka" },
  { key: "plastmassi", labelKey: "materialPlastmassi" },
  { key: "shabloni", labelKey: "materialShabloni" },
  { key: "cisferi_plastmassi", labelKey: "materialCisferiPlastmassi" },
] as const;

export type MaterialKey = (typeof MATERIAL_FIELDS)[number]["key"];
