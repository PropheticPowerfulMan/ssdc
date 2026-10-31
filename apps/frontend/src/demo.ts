export type Document = {
  id: string;
  title: string;
  classification: number;
  compartments: string[];
  status: string;
  created_at: string;
};
export const levels = [
  "NON CLASSIFIÉ",
  "RESTREINT",
  "CONFIDENTIEL",
  "SECRET",
  "TRÈS SECRET",
];
export const documents: Document[] = [
  {
    id: "DEMO-001",
    title: "Plan de modernisation des services numériques",
    classification: 2,
    compartments: ["DANTIC"],
    status: "released",
    created_at: "2026-10-29T08:30:00Z",
  },
  {
    id: "DEMO-002",
    title: "Compte rendu — comité de gouvernance",
    classification: 1,
    compartments: ["DANTIC"],
    status: "released",
    created_at: "2026-10-28T10:00:00Z",
  },
  {
    id: "DEMO-003",
    title: "Politique de continuité des activités",
    classification: 3,
    compartments: ["CONTINUITÉ"],
    status: "released",
    created_at: "2026-10-27T14:00:00Z",
  },
  {
    id: "DEMO-004",
    title: "Guide de classification documentaire",
    classification: 0,
    compartments: [],
    status: "released",
    created_at: "2026-10-26T09:00:00Z",
  },
  {
    id: "DEMO-005",
    title: "Architecture de référence — exercice fictif",
    classification: 4,
    compartments: ["EXERCICE"],
    status: "released",
    created_at: "2026-10-25T11:00:00Z",
  },
  {
    id: "DEMO-006",
    title: "Inventaire des applications — données synthétiques",
    classification: 2,
    compartments: ["DANTIC"],
    status: "released",
    created_at: "2026-10-24T12:00:00Z",
  },
];
export const events = [
  {
    action: "document.read",
    allowed: true,
    created_at: "2026-10-31T08:42:00Z",
  },
  {
    action: "document.upload",
    allowed: true,
    created_at: "2026-10-31T08:30:00Z",
  },
  {
    action: "access.approved",
    allowed: true,
    created_at: "2026-10-31T08:18:00Z",
  },
  {
    action: "document.read",
    allowed: false,
    created_at: "2026-10-31T08:05:00Z",
  },
];
