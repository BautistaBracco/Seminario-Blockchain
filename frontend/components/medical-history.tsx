"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import {
  AlertCircle,
  Clock,
  User,
  PanelBottom as PillBottle,
  FileText,
} from "lucide-react";

interface MedicalHistoryProps {
  chipId: number;
}

interface MedicalRecord {
  chipId: number;
  cid: string;
  diagnostico: string;
  fecha: string;
  medicamentos: string[];
  notas: string;
  tratamiento: string;
  veterinario: string;
}

export function MedicalHistory({ chipId }: MedicalHistoryProps) {
  const { fetchFullMedicalHistory } = useWeb3();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError(null);
        const medicalReports = await fetchFullMedicalHistory(chipId);

        setRecords(medicalReports);
      } catch (err) {
        console.log("[v0] Error loading medical history");
        setError("No se pudo cargar el historial médico");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [chipId, fetchFullMedicalHistory]);

  if (loading) {
    return (
      <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-blue-800 dark:text-blue-200">
            Cargando historial...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Historial Médico</h3>
      {records.length === 0 ? (
        <Card className="p-6 border-dashed">
          <p className="text-muted-foreground text-sm">
            Sin registros médicos disponibles
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record, idx) => (
            <Card
              key={idx}
              className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary"
            >
              <div className="space-y-3">
                {/* Header con diagnóstico y fecha */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {record.diagnostico}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(record.fecha).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Veterinario */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Veterinario:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {record.veterinario.slice(0, 6)}...
                    {record.veterinario.slice(-4)}
                  </span>
                </div>

                {/* Tratamiento y Notas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Tratamiento
                    </p>
                    <p className="text-foreground">{record.tratamiento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Notas</p>
                    <p className="text-foreground text-sm">{record.notas}</p>
                  </div>
                </div>

                {/* Medicamentos */}
                {record.medicamentos.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <PillBottle className="w-4 h-4 text-primary" />
                      <span className="font-medium">Medicamentos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.medicamentos.map((med, medIdx) => (
                        <span
                          key={medIdx}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
