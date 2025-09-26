import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Key } from "lucide-react";
import { motion } from "framer-motion";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinProject: (invitationCode: string) => Promise<void>;
  isLoading?: boolean;
}

export function JoinProjectModal({
  isOpen,
  onClose,
  onJoinProject,
  isLoading = false,
}: JoinProjectModalProps) {
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    try {
      setError(null);
      await onJoinProject(invitationCode.trim().toUpperCase());
      setInvitationCode("");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to join project"
      );
    }
  };

  const handleClose = () => {
    setInvitationCode("");
    setError(null);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInvitationCode(value);
    if (error) setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-chalk-border">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-chalk-primary-100 rounded-full">
              <Users className="h-6 w-6 text-chalk-primary-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-chalk-text">
                Join Project
              </DialogTitle>
              <DialogDescription className="text-chalk-text-2 mt-1">
                Enter the invitation code to join an existing project
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="invitationCode"
              className="text-chalk-text font-medium"
            >
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Invitation Code
              </div>
            </Label>
            <Input
              id="invitationCode"
              value={invitationCode}
              onChange={handleInputChange}
              placeholder="Enter project code (e.g., ABC123)"
              className="bg-chalk-subtle border-chalk-border text-chalk-text placeholder-chalk-text-3 focus:border-chalk-primary-500 focus:ring-chalk-primary-500/20 text-center font-mono text-lg tracking-wider"
              maxLength={8}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-chalk-text-3">
              Ask your project admin for the invitation code
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                variant="destructive"
                className="bg-red-50/80 border-red-200/60 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <AlertDescription className="text-red-700 font-medium text-sm leading-relaxed">
                      {error}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-chalk-border text-chalk-text hover:bg-chalk-subtle"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !invitationCode.trim()}
              className="bg-green-600 hover:bg-green-700 text-white border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Join Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <div className="border-t border-chalk-border pt-4 mt-4">
          <div className="text-xs text-chalk-text-3 space-y-1">
            <p>• Invitation codes are case-insensitive</p>
            <p>• You'll be added as a member to the project</p>
            <p>• Make sure you have permission from the project admin</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JoinProjectModal;
