export interface NightmareCard {
  name: string;
  count: number;
}

export interface NightmareBuild {
  id: string;
  teamId: string;
  label: string;
  focus: string;
  summary: string;
  score: number;
  saveDate: string;
  cardCount: number;
  faintMemory: number;
  copyCount: number;
  removeCount: number;
  accent: string;
  previewImage: string;
  cards: NightmareCard[];
}

export interface NightmareTeam {
  id: string;
  label: string;
  summary: string;
  builds: NightmareBuild[];
}

export interface NightmareEvent {
  id: string;
  name: string;
  headline: string;
  summary: string;
  heroImage: string;
  logoImage: string;
  teams: NightmareTeam[];
}

const buildBase = "/assets/chaoszero/builds";

export const currentEvent: NightmareEvent = {
  id: "great-rift-top-score-pack",
  name: "Great Rift Top Score Build Pack",
  headline: "Chaos Zero Nightmare - Great Rift Domination Hub",
  summary:
    "Imported from the current top-score Great Rift screenshots. Two teams, six builds, and only the live card lists shown in the captured clears.",
  heroImage: "/assets/chaoszero/hero-story.webp",
  logoImage: "/assets/chaoszero/logo.webp",
  teams: [
    {
      id: "team-01",
      label: "Team 1",
      summary:
        "Burst-first opener group from the current top Great Rift clear. This side handles the front-loaded damage lane.",
      builds: [
        {
          id: "team-1-build-1",
          teamId: "team-01",
          label: "Build 01",
          focus: "Ironclad Counterblade loop",
          summary:
            "The highest-scoring opener on Team 1, anchored by Hew (Ironclad), Fighting Spirit, and double Spore Harvester copies.",
          score: 66390,
          saveDate: "26.02.17",
          cardCount: 8,
          faintMemory: 180,
          copyCount: 3,
          removeCount: 4,
          accent: "linear-gradient(135deg, rgba(255, 188, 94, 0.98), rgba(116, 210, 149, 0.9))",
          previewImage: `${buildBase}/team-1-build-1.png`,
          cards: [
            { name: "Hew (Ironclad)", count: 1 },
            { name: "Fatal Strike", count: 1 },
            { name: "Counterblade", count: 1 },
            { name: "Fighting Spirit", count: 2 },
            { name: "Spore Harvester", count: 2 },
          ],
        },
        {
          id: "team-1-build-2",
          teamId: "team-01",
          label: "Build 02",
          focus: "Darkness sustain stack",
          summary:
            "A compact sustain build that leans on repeated Snack Time copies with darkness scaling and one burst opener.",
          score: 63770,
          saveDate: "26.02.21",
          cardCount: 6,
          faintMemory: 180,
          copyCount: 3,
          removeCount: 5,
          accent: "linear-gradient(135deg, rgba(255, 120, 198, 0.98), rgba(165, 106, 255, 0.88))",
          previewImage: `${buildBase}/team-1-build-2.png`,
          cards: [
            { name: "Strike of Darkness", count: 1 },
            { name: "Resonating Darkness", count: 1 },
            { name: "Snack Time", count: 4 },
          ],
        },
        {
          id: "team-1-build-3",
          teamId: "team-01",
          label: "Build 03",
          focus: "Repose utility shell",
          summary:
            "The leanest Team 1 list. Triple Repose keeps the hand moving while Pendant of Resolution and Sir Kowalski set timing.",
          score: 63910,
          saveDate: "26.03.06",
          cardCount: 5,
          faintMemory: 180,
          copyCount: 2,
          removeCount: 5,
          accent: "linear-gradient(135deg, rgba(244, 222, 121, 0.98), rgba(255, 174, 105, 0.9))",
          previewImage: `${buildBase}/team-1-build-3.png`,
          cards: [
            { name: "Repose", count: 3 },
            { name: "Pendant of Resolution", count: 1 },
            { name: "Sir Kowalski", count: 1 },
          ],
        },
      ],
    },
    {
      id: "team-02",
      label: "Team 2",
      summary:
        "Longer-cycle control and creation side from the same top run. This team closes with sustain, scaling, and card creation.",
      builds: [
        {
          id: "team-2-build-1",
          teamId: "team-02",
          label: "Build 01",
          focus: "Chrono flame setup",
          summary:
            "Chronicle-based setup that turns into triple Flame of Eternity scaling for the second team's control lane.",
          score: 59450,
          saveDate: "26.03.25",
          cardCount: 7,
          faintMemory: 150,
          copyCount: 2,
          removeCount: 4,
          accent: "linear-gradient(135deg, rgba(255, 154, 193, 0.96), rgba(255, 110, 140, 0.92))",
          previewImage: `${buildBase}/team-2-build-1.png`,
          cards: [
            { name: "Chrono Archon", count: 1 },
            { name: "Time Axis Collapse", count: 1 },
            { name: "Chrono Circle", count: 1 },
            { name: "Time Paradox", count: 1 },
            { name: "Flame of Eternity", count: 3 },
          ],
        },
        {
          id: "team-2-build-2",
          teamId: "team-02",
          label: "Build 02",
          focus: "Quantum Seed creation core",
          summary:
            "The highest individual score in the screenshot pack. It runs triple Quantum Seed with Dual Creation and double Reorganize.",
          score: 70360,
          saveDate: "26.03.29",
          cardCount: 7,
          faintMemory: 180,
          copyCount: 2,
          removeCount: 5,
          accent: "linear-gradient(135deg, rgba(129, 168, 255, 0.98), rgba(132, 227, 255, 0.9))",
          previewImage: `${buildBase}/team-2-build-2.png`,
          cards: [
            { name: "Quantum Seed", count: 3 },
            { name: "Dual Creation", count: 1 },
            { name: "Event Horizon", count: 1 },
            { name: "Reorganize", count: 2 },
          ],
        },
        {
          id: "team-2-build-3",
          teamId: "team-02",
          label: "Build 03",
          focus: "Source of Water sustain engine",
          summary:
            "A six-card wave sustain list using four Source of Water copies with Tactical Analysis and Deluge to round the line out.",
          score: 64280,
          saveDate: "26.03.24",
          cardCount: 6,
          faintMemory: 180,
          copyCount: 3,
          removeCount: 5,
          accent: "linear-gradient(135deg, rgba(86, 224, 255, 0.98), rgba(104, 134, 255, 0.9))",
          previewImage: `${buildBase}/team-2-build-3.png`,
          cards: [
            { name: "Source of Water", count: 4 },
            { name: "Tactical Analysis", count: 1 },
            { name: "Deluge", count: 1 },
          ],
        },
      ],
    },
  ],
};

export const archivedEvents: NightmareEvent[] = [];

export function getTeamTotal(team: NightmareTeam): number {
  return team.builds.reduce((sum, build) => sum + build.score, 0);
}

export function getEventTotal(event: NightmareEvent): number {
  return event.teams.reduce((sum, team) => sum + getTeamTotal(team), 0);
}

export function getAllBuilds(event: NightmareEvent): NightmareBuild[] {
  return event.teams.flatMap((team) => team.builds);
}
