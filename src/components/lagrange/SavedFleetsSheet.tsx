import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Trash2, Upload } from "lucide-react";
import { getSavedFleets, removeSavedFleet } from "../../data/lagrange/savedFleets";
import { type SavedFleetMeta } from "../../data/lagrange/savedFleet";

interface SavedFleetsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadFleet: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SavedFleetsSheet({ open, onOpenChange, onLoadFleet }: SavedFleetsSheetProps) {
  const [fleets, setFleets] = useState<SavedFleetMeta[]>([]);

  useEffect(() => {
    if (open) {
      setFleets(getSavedFleets());
    }
  }, [open]);

  const handleDelete = (id: string) => {
    removeSavedFleet(id);
    setFleets(getSavedFleets());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-900 border-cyan-500/30 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-cyan-300">My Fleets</SheetTitle>
          <SheetDescription className="text-gray-400">
            Load or manage your saved fleets
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {fleets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No saved fleets yet.</p>
              <p className="text-sm mt-1">Use "Save Fleet" to save your current fleet.</p>
            </div>
          ) : (
            fleets.map((fleet) => (
              <Card
                key={fleet.id}
                className="bg-gray-800/50 border-cyan-500/20"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-cyan-300 font-medium text-sm truncate flex-1 mr-2">
                      {fleet.name}
                    </h3>
                    <Badge className="bg-cyan-600/30 text-cyan-300 text-xs shrink-0">
                      {fleet.totalCP} CP
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    {fleet.shipCount} ships &middot; {formatDate(fleet.savedAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onLoadFleet(fleet.id)}
                      size="sm"
                      className="bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/40 flex-1"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDelete(fleet.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
