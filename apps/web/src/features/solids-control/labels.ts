import { SCE_TYPES, type SceType } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema.
const SCE_TYPE_LABELS: Record<SceType, string> = {
  shale_shaker: "Shale shaker",
  desander: "Desander",
  desilter: "Desilter",
  mud_cleaner: "Mud cleaner",
  centrifuge: "Centrifuge",
  degasser: "Degasser",
  other: "Other",
};

export const sceTypeLabel = (type: SceType) => SCE_TYPE_LABELS[type];

export const SCE_TYPE_OPTIONS: SelectOption[] = SCE_TYPES.map((type) => ({
  value: type,
  label: SCE_TYPE_LABELS[type],
}));
