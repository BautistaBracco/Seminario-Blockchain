"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoSalud } from "@/lib/abis";
import { AlertTriangle, CheckCircle, Stethoscope, XCircle } from "lucide-react";

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTProperties {
  chipId: string | number;
  duenoAddress: string;
}

export interface Pet {
  name: string;
  description: string;
  image: string; // ipfs://CID
  attributes: NFTAttribute[];
  properties: NFTProperties;
  estadoDeSalud: EstadoSalud;
}

interface PetCardProps {
  pet: Pet;
  id: string | number; // ID del NFT para rutas
}

/** Convierte ipfs://CID → https://ipfs.io/ipfs/CID */
const ipfsToHttp = (uri: string) =>
  uri.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`
    : uri;

/** Obtiene atributos por tipo */
const attr = (pet: Pet, trait: string) =>
  pet.attributes.find((a) => a.trait_type === trait)?.value || "-";

// --- FUNCIÓN AUXILIAR PARA ESTILOS DE ESTADO DE SALUD ---
const getHealthStateStyles = (estado: EstadoSalud) => {
  switch (estado) {
    case EstadoSalud.SANO:
      return {
        text: "Saludable",
        icon: CheckCircle,
        // Clases de Tailwind para un badge verde
        classes: "bg-green-100 text-green-700 border-green-300",
      };
    case EstadoSalud.ENFERMO:
      return {
        text: "Enfermo / Alerta",
        icon: AlertTriangle,
        // Clases de Tailwind para un badge rojo/naranja
        classes: "bg-orange-100 text-orange-700 border-orange-300",
      };
    case EstadoSalud.FALLECIDO:
      return {
        text: "Fallecido",
        icon: XCircle,
        // Clases de Tailwind para un badge negro/gris oscuro
        classes: "bg-gray-100 text-gray-500 border-gray-300",
      };
    default:
      return {
        text: "Desconocido",
        icon: XCircle,
        classes: "bg-gray-100 text-gray-500 border-gray-300",
      };
  }
};

export function PetCard({ pet, id }: PetCardProps) {
  const healthState = getHealthStateStyles(pet.estadoDeSalud);
  const IconComponent = healthState.icon; // Componente de icono de Lucide
  return (
    <Card className="p-6 border-2 transition-all hover:border-primary/50 space-y-4">
      <div className="text-center">
        {/* Imagen */}
        <img
          src={ipfsToHttp(pet.image)}
          alt={pet.name}
          loading="lazy"
          className="rounded-lg object-cover mx-auto h-48 w-48"
        />
        {/* Nombre */}
        <h3 className="text-xl font-bold mt-3">{pet.name}</h3>
        {/* 🌟 ESTADO DE SALUD (NUEVO) 🌟 */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-semibold rounded-full border ${healthState.classes}`}
        >
          <IconComponent className="h-4 w-4 shrink-0" />
          <span>Estado: {healthState.text}</span>
        </div>
        {/* ----------------------------------- */}

        {/* Info del animal */}
        <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Especie</p>
              <p className="font-semibold">{attr(pet, "Especie")}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Raza</p>
              <p className="font-semibold">{attr(pet, "Raza")}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Nacimiento</p>
              <p className="font-semibold text-xs">
                {attr(pet, "Fecha de Nacimiento")}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="font-semibold">{attr(pet, "Color")}</p>
            </div>
          </div>

          {/* Chip ID */}
          <div>
            <p className="text-xs text-muted-foreground">Chip ID</p>
            <p className="font-semibold">{pet.properties.chipId}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2 mt-3">
          <Link
            href={`/pet/${id}/medical-history?=name=${pet.name}`}
            className="block"
          >
            <Button className="w-full" size="sm">
              Ver Historial Médico
            </Button>
          </Link>

          <Link href={`/pet/${id}/transfer?name=${pet.name}`} className="block">
            <Button className="w-full" size="sm" variant="outline">
              Transferir Animal
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
