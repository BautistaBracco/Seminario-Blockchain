"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { useIPFS } from "@/hooks/use-ipfs";
import { Card } from "@/components/ui/card";
import { EstadoSalud } from "@/lib/abis";

interface MedicalRecordFormProps {
  onSuccess?: (cid: string, chipId: number) => void;
}

export function MedicalRecordForm({ onSuccess }: MedicalRecordFormProps) {
  const {
    account,
    connectWallet,
    addMedicalRecord,
    loading: web3Loading,
  } = useWeb3();
  const { uploadJSON, loading: ipfsLoading } = useIPFS();
  const [formData, setFormData] = useState({
    chipId: "",
    diagnostico: "",
    tratamiento: "",
    medicamentos: "",
    notas: "",
    estadoSalud: EstadoSalud.SANO.toString(),
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setUploading(true);

      if (!account) {
        const connectedAccount = await connectWallet();
        if (!connectedAccount) {
          setError("Conexión cancelada");
          return;
        }
      }
      const chipId = Number.parseInt(formData.chipId);
      const medicalRecord = {
        chipId,
        fecha: new Date().toISOString(),
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        medicamentos: formData.medicamentos.split(",").map((m) => m.trim()),
        notas: formData.notas,
        veterinario: account,
      };

      const cid = await uploadJSON(medicalRecord);
      const estadoSalud = Number.parseInt(formData.estadoSalud);

      await addMedicalRecord(chipId, cid, estadoSalud);

      setSuccess(`Registro guardado`);
      setFormData({
        chipId: "",
        diagnostico: "",
        tratamiento: "",
        medicamentos: "",
        notas: "",
        estadoSalud: EstadoSalud.SANO.toString(),
      });

      if (onSuccess) {
        onSuccess(cid, chipId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      if (
        !message.includes("Transacción cancelada") &&
        !message.includes("Conexión cancelada")
      ) {
        setError("Error al procesar registro");
      }
    } finally {
      setUploading(false);
    }
  };

  const isLoading = web3Loading || ipfsLoading || uploading;

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Agregar Registro Médico</h2>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg text-primary text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Chip ID del Animal
            </label>
            <input
              type="number"
              placeholder="ID único del chip"
              required
              value={formData.chipId}
              onChange={(e) =>
                setFormData({ ...formData, chipId: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estado de Salud
            </label>
            <select
              value={formData.estadoSalud}
              onChange={(e) =>
                setFormData({ ...formData, estadoSalud: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value={EstadoSalud.SANO.toString()}>Sano</option>
              <option value={EstadoSalud.ENFERMO.toString()}>Enfermo</option>
              <option value={EstadoSalud.FALLECIDO.toString()}>
                Fallecido
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Diagnóstico</label>
          <textarea
            placeholder="Descripción del diagnóstico"
            required
            value={formData.diagnostico}
            onChange={(e) =>
              setFormData({ ...formData, diagnostico: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={2}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tratamiento Recomendado
          </label>
          <textarea
            placeholder="Tratamiento a seguir"
            value={formData.tratamiento}
            onChange={(e) =>
              setFormData({ ...formData, tratamiento: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={2}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Medicamentos (separados por comas)
          </label>
          <input
            type="text"
            placeholder="Ej: Amoxicilina, Ibuprofeno"
            value={formData.medicamentos}
            onChange={(e) =>
              setFormData({ ...formData, medicamentos: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notas Adicionales
          </label>
          <textarea
            placeholder="Notas relevantes..."
            value={formData.notas}
            onChange={(e) =>
              setFormData({ ...formData, notas: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={2}
          ></textarea>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
        >
          {isLoading ? "Procesando..." : "Subir a IPFS y Registrar"}
        </Button>
      </form>
    </Card>
  );
}
