import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SaveFleetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveFleetDialog({ open, onClose, onSave }: SaveFleetDialogProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
  };

  const handleCancel = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={handleCancel}
      />
      <DialogContent className="bg-gray-900 border-cyan-500/30 z-50">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">Save Fleet</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <label className="text-sm text-gray-400 mb-1 block">Fleet Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="e.g. My PvP Fleet"
            className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/40"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
