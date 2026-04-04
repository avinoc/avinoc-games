import { useEffect, useState } from "react";
import { FolderOpen, Save, Share2, Trash2 } from "lucide-react";
import { type Ship, type ShipClass, ships, SHIP_CLASSES, CLASS_ICONS } from "../../data/lagrange/ships";
import { showError, showSuccess } from "./toast";
import { supabase } from "../../data/lagrange/supabase";
import { SaveFleetDialog } from "./SaveFleetDialog";
import { SavedFleetsSheet } from "./SavedFleetsSheet";
import { addSavedFleet } from "../../data/lagrange/savedFleets";

interface FleetItem {
  ship: Ship;
  count: number;
}

const CLASS_LABELS: Record<ShipClass, string> = {
  Fighter: "Fighters",
  Corvette: "Corvettes",
  Frigate: "Frigates",
  Destroyer: "Destroyers",
  Cruiser: "Cruisers",
  Battlecruiser: "Battlecruisers",
  Carrier: "Carriers",
  Battleship: "Battleships",
};

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

export default function FleetBuilder() {
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeClasses, setActiveClasses] = useState<Record<ShipClass, boolean>>({
    Fighter: true,
    Corvette: true,
    Frigate: true,
    Destroyer: true,
    Cruiser: true,
    Battlecruiser: true,
    Carrier: true,
    Battleship: true,
  });
  const [totalCP, setTotalCP] = useState(0);
  const [maxCP, setMaxCP] = useState<number>(400);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedFleetsOpen, setSavedFleetsOpen] = useState(false);

  useEffect(() => {
    const savedFleet = localStorage.getItem("fleetBuilderFleet");
    const savedMaxCP = localStorage.getItem("fleetBuilderMaxCP");

    if (savedFleet) {
      try {
        const parsedFleet = JSON.parse(savedFleet);
        setFleet(parsedFleet);
        calculateTotalCP(parsedFleet);
      } catch (error) {
        console.error("Failed to parse fleet from localStorage", error);
      }
    }

    if (savedMaxCP) {
      try {
        setMaxCP(JSON.parse(savedMaxCP));
      } catch (error) {
        console.error("Failed to parse maxCP from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fleetBuilderFleet", JSON.stringify(fleet));
    calculateTotalCP(fleet);
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem("fleetBuilderMaxCP", JSON.stringify(maxCP));
  }, [maxCP]);

  useEffect(() => {
    importFleetFromURL(window.location.href);
  }, []);

  const calculateTotalCP = (fleetItems: FleetItem[]) => {
    const total = fleetItems.reduce((sum, item) => sum + item.ship.cp * item.count, 0);
    setTotalCP(total);
  };

  const addShip = (ship: Ship) => {
    setFleet((previousFleet) => {
      const existingItem = previousFleet.find((item) => item.ship.id === ship.id);

      if (existingItem) {
        return previousFleet.map((item) =>
          item.ship.id === ship.id ? { ...item, count: item.count + 1 } : item,
        );
      }

      return [...previousFleet, { ship: { ...ship }, count: 1 }];
    });
  };

  const reinforceShip = (ship: Ship) => {
    const reinforcedShip = {
      ...ship,
      id: `${ship.id}-reinforced`,
      cp: 0,
    };

    setFleet((previousFleet) => {
      const existingItem = previousFleet.find((item) => item.ship.id === reinforcedShip.id);

      if (existingItem) {
        return previousFleet.map((item) =>
          item.ship.id === reinforcedShip.id ? { ...item, count: item.count + 1 } : item,
        );
      }

      return [...previousFleet, { ship: reinforcedShip, count: 1 }];
    });
  };

  const removeShip = (shipId: string) => {
    setFleet((previousFleet) => {
      const existingItem = previousFleet.find((item) => item.ship.id === shipId);

      if (existingItem && existingItem.count > 1) {
        return previousFleet.map((item) =>
          item.ship.id === shipId ? { ...item, count: item.count - 1 } : item,
        );
      }

      return previousFleet.filter((item) => item.ship.id !== shipId);
    });
  };

  const clearFleet = () => {
    setFleet([]);
  };

  const importFleetFromURL = (url: string) => {
    const path = url.split("?")[0];
    const pathMatch = path.match(/\/(?:lagrange\/)?fleet\/([a-zA-Z0-9-]+)/);

    if (pathMatch?.[1]) {
      void loadFleetFromSupabase(pathMatch[1]);
      return;
    }

    const params = new URLSearchParams(url.split("?")[1] || "");
    const fleetHash = params.get("fleet");

    if (!fleetHash) return;

    const savedFleet = localStorage.getItem(`fleet_${fleetHash}`);

    if (!savedFleet) {
      showError("Fleet not found. The share code might be invalid.");
      return;
    }

    try {
      const decodedFleet = JSON.parse(savedFleet);
      setFleet(decodedFleet);
      calculateTotalCP(decodedFleet);
      showSuccess("Legacy fleet imported.");
    } catch (error) {
      showError("Failed to import fleet.");
      console.error("Failed to parse fleet from localStorage", error);
    }
  };

  const loadFleetFromSupabase = async (uuid: string) => {
    const { data, error } = await supabase
      .from("fleets")
      .select("fleet_data")
      .eq("id", uuid)
      .single();

    if (error) {
      showError("Failed to load fleet.");
      console.error("Error loading fleet:", error);
      return;
    }

    if (!data) return;

    try {
      const parsedFleet = JSON.parse(data.fleet_data);
      setFleet(parsedFleet);
      calculateTotalCP(parsedFleet);
      showSuccess("Fleet loaded successfully.");
    } catch (error) {
      showError("Failed to parse fleet data.");
      console.error("Failed to parse fleet data", error);
    }
  };

  const toggleClass = (shipClass: ShipClass) => {
    setActiveClasses((previous) => ({
      ...previous,
      [shipClass]: !previous[shipClass],
    }));
  };

  const toggleAllClasses = () => {
    const nextValue = !Object.values(activeClasses).every(Boolean);
    setActiveClasses({
      Fighter: nextValue,
      Corvette: nextValue,
      Frigate: nextValue,
      Destroyer: nextValue,
      Cruiser: nextValue,
      Battlecruiser: nextValue,
      Carrier: nextValue,
      Battleship: nextValue,
    });
  };

  const generateShareCode = async () => {
    if (fleet.length === 0) {
      showError("Your fleet is empty. Add ships to generate a share code.");
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + 2000 * 365 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("fleets")
        .insert([
          {
            id: generateUUID(),
            fleet_data: JSON.stringify(fleet),
            expires_at: expiresAt.toISOString(),
          },
        ])
        .select("id");

      if (error) throw error;

      const uuid = data?.[0]?.id;

      if (!uuid) {
        throw new Error("Failed to get generated UUID from Supabase response.");
      }

      const shareUrl = `${window.location.origin}/lagrange/fleet/${uuid}`;
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Share link copied to clipboard.");
    } catch (error) {
      console.error("Error generating share code:", error);
      const message = error instanceof Error ? error.message : null;
      showError(message ? `Failed to generate share code: ${message}` : "Failed to generate share code.");
    }
  };

  const saveFleet = async (name: string) => {
    if (fleet.length === 0) {
      showError("Your fleet is empty. Add ships to save a fleet.");
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + 2000 * 365 * 24 * 60 * 60 * 1000);
      const id = generateUUID();

      const { error } = await supabase
        .from("fleets")
        .insert([{ id, fleet_data: JSON.stringify(fleet), expires_at: expiresAt.toISOString() }]);

      if (error) throw error;

      addSavedFleet({
        id,
        name,
        totalCP,
        shipCount: fleet.reduce((sum, item) => sum + item.count, 0),
        savedAt: new Date().toISOString(),
      });

      setSaveDialogOpen(false);
      showSuccess(`Fleet "${name}" saved.`);
    } catch (error) {
      console.error("Error saving fleet:", error);
      showError("Failed to save fleet.");
    }
  };

  const handleLoadFleet = async (id: string) => {
    await loadFleetFromSupabase(id);
    setSavedFleetsOpen(false);
  };

  const filteredShips = ships.filter((ship) => {
    const matchesSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase());
    const classActive = activeClasses[ship.shipClass];
    return matchesSearch && classActive;
  });

  const totalShips = fleet.reduce((sum, item) => sum + item.count, 0);
  const reinforcementCount = fleet.reduce(
    (sum, item) => sum + (item.ship.id.endsWith("-reinforced") ? item.count : 0),
    0,
  );
  const cpUsage = maxCP > 0 ? Math.min(100, (totalCP / maxCP) * 100) : 0;
  const classCounts = SHIP_CLASSES.map((shipClass) => ({
    shipClass,
    count: fleet
      .filter((item) => item.ship.shipClass === shipClass)
      .reduce((sum, item) => sum + item.count, 0),
  }));

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[#040913]/95 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,184,212,0.14),transparent_26%),radial-gradient(circle_at_18%_14%,rgba(74,158,197,0.12),transparent_22%),linear-gradient(180deg,rgba(4,10,18,0.92),rgba(5,10,18,0.98))]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.42)_0_1px,transparent_1.8px),radial-gradient(circle_at_28%_10%,rgba(120,190,220,0.3)_0_1px,transparent_1.8px),radial-gradient(circle_at_61%_16%,rgba(255,255,255,0.25)_0_1px,transparent_1.8px),radial-gradient(circle_at_84%_22%,rgba(120,190,220,0.2)_0_1px,transparent_1.8px)]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-7">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
              Fleet Planner
            </p>
            <h1 className="mt-2 font-['Rajdhani'] text-4xl font-bold leading-none tracking-[-0.04em] text-slate-50 md:text-5xl">
              Command bridge composition board
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Filter the ship registry by class, stage the active fleet in the center lane, and keep the live CP budget visible while you plan.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:flex">
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#4a9ec5]/35 bg-[#173249]/85 px-4 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-[#214564]"
            >
              <Save className="h-4 w-4" />
              Save Fleet
            </button>
            <button
              onClick={() => setSavedFleetsOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/70 px-4 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-[#4a9ec5]/40"
            >
              <FolderOpen className="h-4 w-4" />
              My Fleets
            </button>
            <button
              onClick={generateShareCode}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#4a9ec5]/35 bg-slate-900/70 px-4 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-[#6bb8d4]/50"
            >
              <Share2 className="h-4 w-4" />
              Share Fleet
            </button>
            <button
              onClick={clearFleet}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-500/25 bg-red-950/40 px-4 text-sm font-semibold text-red-200 transition hover:-translate-y-0.5 hover:bg-red-900/45"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
          <aside className="grid gap-4">
            <section className="rounded-[1.4rem] border border-slate-700/60 bg-slate-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ship Categories
                  </p>
                  <h2 className="mt-1 font-['Rajdhani'] text-2xl font-bold leading-none text-slate-50">
                    Command Filters
                  </h2>
                </div>
                <button
                  onClick={toggleAllClasses}
                  className="rounded-full border border-slate-600/70 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-[#4a9ec5]/40 hover:text-white"
                >
                  {Object.values(activeClasses).every(Boolean) ? "Hide all" : "Show all"}
                </button>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Search Registry
                </span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search ships"
                  className="w-full rounded-2xl border border-slate-700/70 bg-[#0b1623] px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#4a9ec5]/55"
                />
              </label>

              <div className="mt-4 grid gap-2">
                {SHIP_CLASSES.map((shipClass) => {
                  const active = activeClasses[shipClass];

                  return (
                    <button
                      key={shipClass}
                      onClick={() => toggleClass(shipClass)}
                      className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${
                        active
                          ? "border-[#4a9ec5]/40 bg-[#102131] text-slate-50"
                          : "border-slate-700/70 bg-slate-900/60 text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-current/15 bg-white/5 text-base">
                          {CLASS_ICONS[shipClass]}
                        </span>
                        <span>
                          <strong className="block text-sm font-semibold">{CLASS_LABELS[shipClass]}</strong>
                          <small className="text-xs uppercase tracking-[0.14em] opacity-70">
                            {shipClass}
                          </small>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-slate-700/60 bg-slate-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ship Registry
                  </p>
                  <h2 className="mt-1 font-['Rajdhani'] text-2xl font-bold leading-none text-slate-50">
                    Available Ships
                  </h2>
                </div>
                <span className="rounded-full border border-slate-700/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {filteredShips.length}
                </span>
              </div>

              <div className="mt-4 grid max-h-[32rem] gap-3 overflow-y-auto pr-1">
                {filteredShips.map((ship) => {
                  const canAdd = totalCP + ship.cp <= maxCP;

                  return (
                    <article
                      key={ship.id}
                      className="rounded-2xl border border-slate-700/70 bg-[#0b1623]/95 p-3 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-50">{ship.name}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                            {CLASS_LABELS[ship.shipClass]}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#4a9ec5]/22 bg-[#173249]/75 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                          Tier {ship.tier}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
                        <span>CP {ship.cp}</span>
                        <span>{CLASS_ICONS[ship.shipClass]} {ship.shipClass}</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addShip(ship)}
                          disabled={!canAdd}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                            canAdd
                              ? "bg-[#214564] text-cyan-100 hover:-translate-y-0.5 hover:bg-[#2a5377]"
                              : "cursor-not-allowed bg-slate-800/80 text-slate-500"
                          }`}
                        >
                          Add Hull
                        </button>
                        <button
                          onClick={() => reinforceShip(ship)}
                          className="rounded-xl border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:-translate-y-0.5 hover:border-emerald-400/35 hover:text-emerald-100"
                        >
                          Reinforce
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </aside>

          <main className="grid gap-4">
            <section className="rounded-[1.5rem] border border-[#4a9ec5]/20 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Active Fleet
                  </p>
                  <h2 className="mt-1 font-['Rajdhani'] text-3xl font-bold leading-none text-slate-50">
                    Center formation lane
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                  <span className="rounded-full border border-slate-700/70 px-3 py-1">{totalShips} ships</span>
                  <span className="rounded-full border border-slate-700/70 px-3 py-1">{reinforcementCount} reinforcements</span>
                  <span className="rounded-full border border-slate-700/70 px-3 py-1">{totalCP} CP online</span>
                </div>
              </div>

              {fleet.length === 0 ? (
                <div className="mt-4 grid min-h-[18rem] place-items-center rounded-[1.3rem] border border-dashed border-slate-700/80 bg-[#08111d]/90 px-6 text-center">
                  <div>
                    <p className="font-['Rajdhani'] text-3xl font-bold text-slate-200">No hulls staged</p>
                    <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
                      Use the ship registry on the left to add hulls into the active formation. Reinforcements stay visible as zero-CP stack entries.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {fleet.map((item) => {
                    const reinforced = item.ship.id.endsWith("-reinforced");

                    return (
                      <article
                        key={item.ship.id}
                        className="relative overflow-hidden rounded-[1.25rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(12,23,38,0.98),rgba(8,16,28,0.98))] p-4 shadow-[0_18px_34px_rgba(0,0,0,0.22)]"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(107,184,212,0.72),transparent)]" />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                              {CLASS_LABELS[item.ship.shipClass]}
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-slate-50">{item.ship.name}</h3>
                          </div>
                          <button
                            onClick={() => removeShip(item.ship.id)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-red-500/18 bg-red-950/35 text-red-200 transition hover:border-red-400/35 hover:bg-red-900/40"
                            aria-label={`Remove ${item.ship.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                            <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Tier</span>
                            <strong className="mt-1 block text-sm text-slate-100">{item.ship.tier}</strong>
                          </div>
                          <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                            <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Count</span>
                            <strong className="mt-1 block text-sm text-slate-100">{item.count}</strong>
                          </div>
                          <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                            <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Total CP</span>
                            <strong className="mt-1 block text-sm text-slate-100">{item.ship.cp * item.count}</strong>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                          <span>
                            {CLASS_ICONS[item.ship.shipClass]} {item.ship.shipClass}
                          </span>
                          <span className={reinforced ? "text-emerald-200" : "text-cyan-100"}>
                            {reinforced ? "Reinforcement" : `${item.ship.cp} CP each`}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          <aside className="grid gap-4">
            <section className="rounded-[1.4rem] border border-slate-700/60 bg-slate-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Fleet Statistics
              </p>
              <h2 className="mt-1 font-['Rajdhani'] text-3xl font-bold leading-none text-slate-50">
                Command Budget
              </h2>

              <div className="mt-4 rounded-[1.15rem] border border-slate-700/70 bg-[#08111d]/90 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <span className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">CP gauge</span>
                    <p className="mt-1 text-3xl font-bold text-slate-50">{totalCP}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">Max</span>
                    <p className="mt-1 text-lg font-semibold text-slate-200">{maxCP}</p>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900/90">
                  <div
                    className={`h-full rounded-full ${
                      totalCP > maxCP ? "bg-red-500" : "bg-[linear-gradient(90deg,#3b7ba3,#6bb8d4)]"
                    }`}
                    style={{ width: `${cpUsage}%` }}
                  />
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-2">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Max CP
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={maxCP}
                        onChange={(event) => setMaxCP(Math.max(0, Number(event.target.value) || 0))}
                        className="w-full rounded-xl border border-slate-700/70 bg-slate-900/75 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[#4a9ec5]/55"
                      />
                      <button
                        onClick={() => setMaxCP(400)}
                        className="rounded-xl border border-slate-600/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#4a9ec5]/40"
                      >
                        Reset
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {classCounts.map(({ shipClass, count }) => (
                  <div
                    key={shipClass}
                    className="flex items-center justify-between rounded-xl border border-slate-700/70 bg-slate-900/65 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/5 bg-white/5 text-xs">
                        {CLASS_ICONS[shipClass]}
                      </span>
                      {CLASS_LABELS[shipClass]}
                    </span>
                    <strong className="text-slate-100">{count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-slate-700/60 bg-slate-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Deployment Readout
              </p>
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-slate-700/70 bg-[#08111d]/90 px-3 py-3">
                  <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Active hulls</span>
                  <strong className="mt-1 block text-xl text-slate-50">{totalShips}</strong>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-[#08111d]/90 px-3 py-3">
                  <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Reinforcement stacks</span>
                  <strong className="mt-1 block text-xl text-slate-50">{reinforcementCount}</strong>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-[#08111d]/90 px-3 py-3">
                  <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">Budget status</span>
                  <strong className={`mt-1 block text-xl ${totalCP > maxCP ? "text-red-300" : "text-cyan-100"}`}>
                    {totalCP > maxCP ? "Over cap" : "Within cap"}
                  </strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <SaveFleetDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={saveFleet}
      />
      <SavedFleetsSheet
        open={savedFleetsOpen}
        onOpenChange={setSavedFleetsOpen}
        onLoadFleet={handleLoadFleet}
      />
    </div>
  );
}
