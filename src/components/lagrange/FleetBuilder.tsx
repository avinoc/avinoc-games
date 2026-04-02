import { useState, useEffect } from "react";
import { Ship, ships, SHIP_CLASSES } from "../../data/lagrange/ships";
import { ShipCard } from "./ShipCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";
import {
  Copy,
  Share2,
  Trash2,
  Plus,
  Filter,
  X,
  Download,
  Settings,
  Save,
  FolderOpen
} from "lucide-react";
import { showSuccess, showError } from "./toast";
import { supabase } from "../../data/lagrange/supabase";
import { SaveFleetDialog } from "./SaveFleetDialog";
import { SavedFleetsSheet } from "./SavedFleetsSheet";
import { addSavedFleet } from "../../data/lagrange/savedFleets";

interface FleetItem {
  ship: Ship;
  count: number;
}

// New UUID generation function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function FleetBuilder() {
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<Ship["shipClass"] | "All">("All");
  const [totalCP, setTotalCP] = useState(0);
  const [activeClasses, setActiveClasses] = useState<Record<Ship["shipClass"], boolean>>({
    Fighter: true,
    Corvette: true,
    Frigate: true,
    Destroyer: true,
    Cruiser: true,
    Battlecruiser: true,
    Carrier: true,
    Battleship: true,
  });
  const [maxCP, setMaxCP] = useState<number>(400);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedFleetsOpen, setSavedFleetsOpen] = useState(false);

  // Load fleet and maxCP from localStorage on mount
  useEffect(() => {
    const savedFleet = localStorage.getItem("fleetBuilderFleet");
    const savedMaxCP = localStorage.getItem("fleetBuilderMaxCP");
    
    if (savedFleet) {
      try {
        const parsedFleet = JSON.parse(savedFleet);
        setFleet(parsedFleet);
        calculateTotalCP(parsedFleet);
      } catch (e) {
        console.error("Failed to parse fleet from localStorage", e);
      }
    }
    
    if (savedMaxCP) {
      try {
        const parsedMaxCP = JSON.parse(savedMaxCP);
        setMaxCP(parsedMaxCP);
      } catch (e) {
        console.error("Failed to parse maxCP from localStorage", e);
      }
    }
  }, []);

  // Save fleet and maxCP to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("fleetBuilderFleet", JSON.stringify(fleet));
    calculateTotalCP(fleet);
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem("fleetBuilderMaxCP", JSON.stringify(maxCP));
  }, [maxCP]);

  const calculateTotalCP = (fleetItems: FleetItem[]) => {
    const total = fleetItems.reduce((sum, item) => sum + (item.ship.cp * item.count), 0);
    setTotalCP(total);
  };

  const addShip = (ship: Ship) => {
    setFleet(prevFleet => {
      const existingItem = prevFleet.find(item => item.ship.id === ship.id);
      
      if (existingItem) {
        return prevFleet.map(item => 
          item.ship.id === ship.id 
            ? { ...item, count: item.count + 1 } 
            : item
        );
      } else {
        return [...prevFleet, { ship: { ...ship }, count: 1 }];
      }
    });
  };

  const reinforceShip = (ship: Ship) => {
    // Create a new ship object with a distinct identifier for reinforcement
    const reinforcedShip = {
      ...ship,
      id: `${ship.id}-reinforced`,
      cp: 0,
    };
    setFleet(prevFleet => {
      const existingItem = prevFleet.find(item => item.ship.id === reinforcedShip.id);
      
      if (existingItem) {
        return prevFleet.map(item => 
          item.ship.id === reinforcedShip.id 
            ? { ...item, count: item.count + 1 } 
            : item
        );
      } else {
        return [...prevFleet, { ship: reinforcedShip, count: 1 }];
      }
    });
  };

  const removeShip = (shipId: string) => {
    setFleet(prevFleet => {
      const existingItem = prevFleet.find(item => item.ship.id === shipId);
      
      if (existingItem && existingItem.count > 1) {
        return prevFleet.map(item => 
          item.ship.id === shipId 
            ? { ...item, count: item.count - 1 } 
            : item
        );
      } else {
        return prevFleet.filter(item => item.ship.id !== shipId);
      }
    });
  };

  const clearFleet = () => {
    setFleet([]);
  };

  // Function to import fleet from URL (now handles both old and new sharing formats)
  const importFleetFromURL = (url: string) => {
    // Check for new path-based sharing format
    const path = url.split('?')[0];
    const match = path.match(/\/fleet\/([a-zA-Z0-9]+)/);
    
    if (match && match[1]) {
      const uuid = match[1];
      loadFleetFromSupabase(uuid);
      return;
    }

    // Check for old query parameter sharing format
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const fleetHash = urlParams.get("fleet");
    
    if (fleetHash) {
      const savedFleet = localStorage.getItem(`fleet_${fleetHash}`);
      
      if (savedFleet) {
        try {
          const decodedFleet = JSON.parse(savedFleet);
        } catch (e) {
          showError("Failed to import fleet");
          console.error("Failed to parse fleet from localStorage", e);
        }
      } else {
        showError("Fleet not found. The share code might be invalid.");
        console.error("Fleet not found in localStorage");
      }
    }
  };

  // Load fleet from Supabase by UUID
  const loadFleetFromSupabase = async (uuid: string) => {
    const { data, error } = await supabase
      .from('fleets')
      .select('fleet_data')
      .eq('id', uuid)
      .single();

    if (error) {
      showError("Failed to load fleet");
      console.error("Error loading fleet:", error);
      return;
    }

    if (data) {
      try {
        const parsedFleet = JSON.parse(data.fleet_data);
        setFleet(parsedFleet);
        calculateTotalCP(parsedFleet);
        showSuccess("Fleet loaded successfully!");
      } catch (e) {
        showError("Failed to parse fleet data");
        console.error("Failed to parse fleet data", e);
      }
    }
  };

  // Load fleet from URL on mount
  useEffect(() => {
    const url = window.location.href;
    importFleetFromURL(url);
  }, []);

  const filteredShips = ships.filter(ship => {
    const matchesSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || ship.shipClass === selectedClass;
    const classActive = activeClasses[ship.shipClass];
    return matchesSearch && matchesClass && classActive;
  });

  const getShipClassCount = (shipClass: Ship["shipClass"]) => {
    return fleet
      .filter(item => item.ship.shipClass === shipClass)
      .reduce((sum, item) => sum + item.count, 0);
  };

  const toggleClass = (shipClass: Ship["shipClass"]) => {
    setActiveClasses(prev => ({
      ...prev,
      [shipClass]: !prev[shipClass]
    }));
  };

  const toggleAllClasses = () => {
    const allActive = Object.values(activeClasses).every(active => active);
    setActiveClasses(prev => ({
      Fighter: !allActive,
      Corvette: !allActive,
      Frigate: !allActive,
      Destroyer: !allActive,
      Cruiser: !allActive,
      Battlecruiser: !allActive,
      Carrier: !allActive,
      Battleship: !allActive,
    }));
  };

  const generateShareCode = async () => {
    if (fleet.length === 0) {
      showError("Your fleet is empty. Add ships to generate a share code.");
      return;
    }
    
    try {
      // Calculate expiration time (2000 years from now - effectively never expires)
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + 2000 * 365 * 24 * 60 * 60 * 1000);
      
      // Insert fleet data into Supabase with generated UUID
      const { data, error } = await supabase
        .from('fleets')
        .insert([
          {
            id: generateUUID(),
            fleet_data: JSON.stringify(fleet),
            expires_at: expiresAt.toISOString()
          }
        ])
        .select('id');
      
      if (error) {
        throw error;
      }
      
      const uuid = data?.[0]?.id;
      
      if (!uuid) {
        throw new Error("Failed to get generated UUID from Supabase response");
      }
      
      // Create the shortened URL
      const shareUrl = `${window.location.origin}/fleet/${uuid}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showSuccess("Share code copied to clipboard!");
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          showError("Failed to copy share code");
        });
    } catch (error) {
      console.error("Error generating share code:", error);
      if (error && error.message) {
        showError(`Failed to generate share code: ${error.message}`);
      } else {
        showError("Failed to generate share code. Please check your Supabase configuration and table setup.");
      }
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
        .from('fleets')
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
      showSuccess(`Fleet "${name}" saved!`);
    } catch (error) {
      console.error("Error saving fleet:", error);
      showError("Failed to save fleet.");
    }
  };

  const handleLoadFleet = async (id: string) => {
    await loadFleetFromSupabase(id);
    setSavedFleetsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Fleet Builder
          </h1>
          <p className="text-gray-400">Create your Infinite Lagrange fleet plan</p>
          
          <div className="flex flex-wrap justify-center mt-4 gap-2">
            <Button
              onClick={() => setSaveDialogOpen(true)}
              variant="outline"
              className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Fleet
            </Button>
            <Button
              onClick={() => setSavedFleetsOpen(true)}
              variant="outline"
              className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              My Fleets
            </Button>
            <Button
              onClick={generateShareCode}
              variant="outline"
              className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Fleet
            </Button>
            <Button
              onClick={clearFleet}
              variant="destructive"
              className="bg-red-600/20 hover:bg-red-600/30 text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Fleet
            </Button>
          </div>
        </div>

        {/* Top-right settings box */}
        <div className="absolute top-4 right-4 z-10">
          <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10 w-48">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-300 text-sm font-medium">Max CP</span>
                <Button 
                  onClick={() => setMaxCP(400)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20 text-xs px-2 py-1 h-6"
                >
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={maxCP}
                  onChange={(e) => setMaxCP(Number(e.target.value))}
                  className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400 text-xs w-full"
                  min="0"
                  size={3}
                />
                <span className="text-gray-400 text-xs">Current: {maxCP}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <span className="text-2xl">📋</span> Your Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fleet.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Your fleet is empty. Add ships to get started!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/30">
                    <TableHead className="text-cyan-300">Ship</TableHead>
                    <TableHead className="text-cyan-300 text-right">Class</TableHead>
                    <TableHead className="text-cyan-300 text-right">CP</TableHead>
                    <TableHead className="text-cyan-300 text-right">Count</TableHead>
                    <TableHead className="text-cyan-300 text-right">Total CP</TableHead>
                    <TableHead className="text-cyan-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleet.map((item) => (
                    <TableRow key={item.ship.id} className="border-cyan-500/20">
                      <TableCell className="font-medium text-cyan-300">
                        {item.ship.name}
                        {item.ship.id.endsWith('-reinforced') && (
                          <Badge className="bg-purple-600/50 text-purple-300 ml-2">
                            Reinforced
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-cyan-600/30 text-cyan-300">
                          {item.ship.shipClass}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-cyan-400">{item.ship.cp}</TableCell>
                      <TableCell className="text-right text-cyan-400">{item.count}</TableCell>
                      <TableCell className="text-right text-cyan-400">
                        {item.ship.cp * item.count}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => removeShip(item.ship.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-800/50">
                    <TableCell className="font-bold text-cyan-300">Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right text-cyan-400 font-bold">{fleet.reduce((sum, item) => sum + item.count, 0)}</TableCell>
                    <TableCell className="text-right text-cyan-400 font-bold">{totalCP}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <span className="text-2xl">🚀</span> Ship Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Search ships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400 pl-10"
                  />
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={toggleAllClasses}
                  variant="outline"
                  className="bg-gray-800/50 border-cyan-500/30 text-white hover:bg-cyan-600/20 text-xs px-3 py-1 h-8"
                >
                  {Object.values(activeClasses).every(active => active) ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {SHIP_CLASSES.map(shipClass => (
                  <Button
                    key={shipClass}
                    onClick={() => toggleClass(shipClass)}
                    variant={activeClasses[shipClass] ? "default" : "outline"}
                    className={`bg-gray-800/50 border-cyan-500/30 text-white hover:bg-cyan-600/20 text-xs px-3 py-1 h-8 ${
                      activeClasses[shipClass] ? "bg-cyan-600/20 text-cyan-300" : ""
                    }`}
                  >
                    {shipClass}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShips.map(ship => (
                <ShipCard 
                  key={ship.id} 
                  ship={ship} 
                  onAdd={addShip}
                  onReinforce={reinforceShip}
                  // Only disable the add button, not the reinforce button
                  disabled={totalCP + ship.cp > maxCP}
                />
              ))}
            </div>
          </CardContent>
        </Card>
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