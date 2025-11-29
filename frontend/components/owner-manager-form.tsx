"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function OwnerManagerForm() {
  const { setOwnerEnabled, loading, error, isConnected, connectWallet } =
    useWeb3();
  const [ownerAddress, setOwnerAddress] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-2">
              Wallet no conectada
            </h3>
            <p className="text-amber-800 mb-4">
              Necesitas conectar tu wallet para gestionar dueños.
            </p>
            <Button
              onClick={connectWallet}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Conectar Wallet
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (!ownerAddress.trim()) {
      return;
    }

    try {
      await setOwnerEnabled(ownerAddress, enabled);
      setSuccess(
        `Dueño ${enabled ? "habilitado" : "deshabilitado"} correctamente`,
      );
      setOwnerAddress("");
      setEnabled(true);
    } catch {
      // Error already set by hook
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20">
        <h2 className="text-2xl font-bold mb-6">Gestionar Dueños</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Dirección del Dueño
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ingresa la dirección Ethereum del dueño
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">Estado</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEnabled(true)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  enabled
                    ? "bg-green-100 text-green-900 border-2 border-green-400"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Habilitar
              </button>
              <button
                type="button"
                onClick={() => setEnabled(false)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  !enabled
                    ? "bg-red-100 text-red-900 border-2 border-red-400"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Deshabilitar
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !ownerAddress.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              `${enabled ? "Habilitar" : "Deshabilitar"} Dueño`
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>- Los dueños habilitados pueden recibir y transferir animales</li>
          <li>- Los dueños deshabilitados no pueden realizar transacciones</li>
          <li>- Solo el administrador del sistema puede gestionar dueños</li>
        </ul>
      </Card>
    </div>
  );
}
