import type {
  QuickPlayPresetCount,
  TimeControl,
  TimeControlId
} from "./models";

export const TIME_CONTROL_CATALOG: readonly TimeControl[] = [
  {
    id: "30s-0",
    label: "Play 30 sec",
    baseSeconds: 30,
    incrementSeconds: 0,
    timeClass: "bullet",
    presetAvailability: "desktop"
  },
  {
    id: "20s-1",
    label: "Play 20 sec + 1",
    baseSeconds: 20,
    incrementSeconds: 1,
    timeClass: "bullet",
    presetAvailability: "desktop"
  },
  {
    id: "1-0",
    label: "Play 1 min",
    baseSeconds: 60,
    incrementSeconds: 0,
    timeClass: "bullet",
    presetAvailability: "both"
  },
  {
    id: "1-1",
    label: "Play 1 + 1",
    baseSeconds: 60,
    incrementSeconds: 1,
    timeClass: "bullet",
    presetAvailability: "both"
  },
  {
    id: "2-1",
    label: "Play 2 + 1",
    baseSeconds: 120,
    incrementSeconds: 1,
    timeClass: "bullet",
    presetAvailability: "both"
  },
  {
    id: "3-0",
    label: "Play 3 min",
    baseSeconds: 180,
    incrementSeconds: 0,
    timeClass: "blitz",
    presetAvailability: "both"
  },
  {
    id: "3-2",
    label: "Play 3 + 2",
    baseSeconds: 180,
    incrementSeconds: 2,
    timeClass: "blitz",
    presetAvailability: "both"
  },
  {
    id: "5-0",
    label: "Play 5 min",
    baseSeconds: 300,
    incrementSeconds: 0,
    timeClass: "blitz",
    presetAvailability: "both"
  },
  {
    id: "5-3",
    label: "Play 5 + 3",
    baseSeconds: 300,
    incrementSeconds: 3,
    timeClass: "blitz",
    presetAvailability: "desktop"
  },
  {
    id: "5-2",
    label: "Play 5 + 2",
    baseSeconds: 300,
    incrementSeconds: 2,
    timeClass: "blitz",
    presetAvailability: "mobile"
  },
  {
    id: "5-5",
    label: "Play 5 + 5",
    baseSeconds: 300,
    incrementSeconds: 5,
    timeClass: "blitz",
    presetAvailability: "mobile"
  },
  {
    id: "10-0",
    label: "Play 10 min",
    baseSeconds: 600,
    incrementSeconds: 0,
    timeClass: "rapid",
    presetAvailability: "both"
  },
  {
    id: "10-5",
    label: "Play 10 + 5",
    baseSeconds: 600,
    incrementSeconds: 5,
    timeClass: "rapid",
    presetAvailability: "both"
  },
  {
    id: "15-10",
    label: "Play 15 + 10",
    baseSeconds: 900,
    incrementSeconds: 10,
    timeClass: "rapid",
    presetAvailability: "both"
  },
  {
    id: "20-0",
    label: "Play 20 min",
    baseSeconds: 1200,
    incrementSeconds: 0,
    timeClass: "rapid",
    presetAvailability: "both"
  },
  {
    id: "30-0",
    label: "Play 30 min",
    baseSeconds: 1800,
    incrementSeconds: 0,
    timeClass: "rapid",
    presetAvailability: "both"
  },
  {
    id: "60-0",
    label: "Play 60 min",
    baseSeconds: 3600,
    incrementSeconds: 0,
    timeClass: "rapid",
    presetAvailability: "both"
  }
] as const;

export const DEFAULT_TIME_CONTROL_IDS: readonly TimeControlId[] = [
  "10-0",
  "10-5",
  "15-10",
  "30-0",
  "3-2",
  "5-3"
] as const;

export const DEFAULT_EIGHT_TIME_CONTROL_IDS: readonly TimeControlId[] = [
  "10-0",
  "10-5",
  "15-10",
  "30-0",
  "1-1",
  "3-0",
  "3-2",
  "5-5"
] as const;

export const QUICK_PLAY_EXPANSION_FALLBACK_IDS: readonly TimeControlId[] = [
  "10-0",
  "10-5",
  "15-10",
  "30-0",
  "3-0",
  "3-2",
  "5-5",
  "1-1"
] as const;

export const QUICK_PLAY_PRESET_COUNTS: readonly QuickPlayPresetCount[] = [
  0,
  1,
  2,
  3,
  4,
  6,
  8
] as const;

export const DEFAULT_TIME_CONTROL_IDS_BY_COUNT: Readonly<
  Record<QuickPlayPresetCount, readonly TimeControlId[]>
> = {
  0: [],
  1: ["10-0"],
  2: ["10-0", "15-10"],
  3: ["10-0", "15-10", "3-2"],
  4: ["10-0", "10-5", "15-10", "3-2"],
  6: DEFAULT_TIME_CONTROL_IDS,
  8: DEFAULT_EIGHT_TIME_CONTROL_IDS
};

export function isQuickPlayPresetCount(
  value: unknown
): value is QuickPlayPresetCount {
  return (
    typeof value === "number" &&
    QUICK_PLAY_PRESET_COUNTS.includes(value as QuickPlayPresetCount)
  );
}

export function getDefaultTimeControlIds(
  count: QuickPlayPresetCount
): readonly TimeControlId[] {
  return DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count];
}

export function resizeTimeControlIds(
  currentIds: readonly TimeControlId[],
  nextCount: QuickPlayPresetCount
): TimeControlId[] {
  const nextIds = currentIds.slice(0, nextCount);
  if (nextIds.length >= nextCount) {
    return nextIds;
  }

  const usedIds = new Set(nextIds);
  for (const fallbackId of QUICK_PLAY_EXPANSION_FALLBACK_IDS) {
    if (nextIds.length >= nextCount) {
      break;
    }
    if (usedIds.has(fallbackId)) {
      continue;
    }
    nextIds.push(fallbackId);
    usedIds.add(fallbackId);
  }

  return nextIds;
}

export function getQuickPlayGridDimensions(
  count: QuickPlayPresetCount
): { columns: number; rows: number } {
  if (count === 0) {
    return { columns: 1, rows: 0 };
  }
  return count > 4
    ? { columns: count / 2, rows: 2 }
    : { columns: count, rows: 1 };
}

export const TIME_CONTROLS: readonly TimeControl[] = DEFAULT_TIME_CONTROL_IDS.map(
  (id) => TIME_CONTROL_CATALOG.find((control) => control.id === id)!
);

export interface TimeControlSettingsGroup {
  label: string;
  controls: readonly TimeControl[];
}

export const TIME_CONTROL_SETTINGS_GROUPS: readonly TimeControlSettingsGroup[] =
  [
    {
      label: "Bullet",
      controls: TIME_CONTROL_CATALOG.filter(
        (control) => control.timeClass === "bullet"
      )
    },
    {
      label: "Blitz",
      controls: TIME_CONTROL_CATALOG.filter(
        (control) => control.timeClass === "blitz"
      ).sort(
        (left, right) =>
          left.baseSeconds - right.baseSeconds ||
          left.incrementSeconds - right.incrementSeconds
      )
    },
    {
      label: "Rapid",
      controls: TIME_CONTROL_CATALOG.filter(
        (control) => control.timeClass === "rapid"
      )
    }
  ];

export function getTimeControl(id: string): TimeControl | undefined {
  return TIME_CONTROL_CATALOG.find((control) => control.id === id);
}

export function getTimeControls(ids: readonly string[]): TimeControl[] {
  return ids
    .map((id) => getTimeControl(id))
    .filter((control): control is TimeControl => Boolean(control));
}
