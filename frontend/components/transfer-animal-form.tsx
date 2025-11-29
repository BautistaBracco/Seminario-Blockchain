"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { Card } from "@/components/ui/card";

interface TransferAnimalFormProps {
  chipId: string;
  petName: string;
  onSuccess?: () => void;
}

export function TransferAnimalForm({
  chipId,
  petName,
  onSuccess,
}: TransferAnimalFormProps) {
  const { account, transferAnimal, loading } = useWeb3();
  const [toAddress, setToAddress] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!account) {
        throw new Error("Wallet no conectada");
      }

      if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Dirección Ethereum inválida");
      }

      const txHash = await transferAnimal(account, toAddress, Number(chipId));

      setSuccess(`Transferencia exitosa! TX: ${txHash.slice(0, 10)}...`);
      setToAddress("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
      const message =
        err instanceof Error ? err.message : "Error en transferencia";
      console.error(message);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Transferir {petName}</h3>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary rounded-lg text-primary text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Dirección del nuevo dueño
          </label>
          <input
            type="text"
            placeholder="0x..."
            required
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="p-3 bg-muted/30 rounded-lg text-sm">
          <p className="font-medium">
            Chip ID: <span className="text-primary">{chipId}</span>
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            El animal debe estar sano para ser transferido
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
        >
          {loading ? "Procesando..." : "Confirmar Transferencia"}
        </Button>
      </form>
    </Card>
  );
}
