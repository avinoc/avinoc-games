import { useEffect, useState } from 'react';
import { supabase } from '../../data/lagrange/supabase';
import { Ship, ships, SHIP_CLASSES } from '../../data/lagrange/ships';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { showSuccess, showError } from './toast';

interface FleetItem {
  ship: Ship;
  count: number;
}

export default function FleetShareView() {
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [totalCP, setTotalCP] = useState(0);
  const [loading, setLoading] = useState(true);

  // Extract UUID from window.location on mount
  useEffect(() => {
    const uuid = extractUUIDFromPath();
    if (uuid) {
      loadFleet(uuid);
    } else {
      showError("Invalid fleet link");
      setLoading(false);
    }
  }, []);

  const extractUUIDFromPath = (): string | null => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/\/fleet\/([a-zA-Z0-9\-]+)/);
    return match ? match[1] : null;
  };

  const loadFleet = async (uuid: string) => {
    try {
      const { data, error } = await supabase
        .from('fleets')
        .select('fleet_data')
        .eq('id', uuid)
        .single();

      if (error) {
        showError("Failed to load fleet");
        console.error("Error loading fleet:", error);
        setLoading(false);
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
      } else {
        showError("Fleet not found");
      }
    } catch (error) {
      showError("Failed to load fleet");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCP = (fleetItems: FleetItem[]) => {
    const total = fleetItems.reduce((sum, item) => sum + (item.ship.cp * item.count), 0);
    setTotalCP(total);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-400">Loading fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Fleet Builder
          </h1>
          <p className="text-gray-400">View a shared Infinite Lagrange fleet plan</p>

          <div className="flex justify-center mt-4 gap-2">
            <Button
              onClick={() => window.location.href = '/lagrange/fleet-builder'}
              variant="outline"
              className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20"
            >
              Return to Builder
            </Button>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <span className="text-2xl">📋</span> Shared Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fleet.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Invalid fleet data or expired link. This fleet may have expired.</p>
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
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-800/50">
                    <TableCell className="font-bold text-cyan-300">Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right text-cyan-400 font-bold">{fleet.reduce((sum, item) => sum + item.count, 0)}</TableCell>
                    <TableCell className="text-right text-cyan-400 font-bold">{totalCP}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-400">
          <p>Share this link to allow others to view your fleet plan.</p>
        </div>
      </div>
    </div>
  );
}
