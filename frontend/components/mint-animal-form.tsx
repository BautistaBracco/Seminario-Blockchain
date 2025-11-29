"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { useIPFS } from "@/hooks/use-ipfs";
import { Card } from "@/components/ui/card";

export interface AnimalData {
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  color: string;
  caracteristicas: string;
}

interface MintAnimalFormProps {
  onSuccess?: (cid: string, chipId: number) => void;
}

export function MintAnimalForm({ onSuccess }: MintAnimalFormProps) {
  const {
    account,
    connectWallet,
    mintAnimal,
    loading: web3Loading,
  } = useWeb3();
  const { uploadJSON, uploadFile, loading: ipfsLoading } = useIPFS();
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    fechaNacimiento: "",
    chipId: "",
    color: "",
    caracteristicas: "",
    duenoAddress: "",
    imagen: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setUploading(true);

      // 1. Conexión de Wallet
      if (!account) {
        const connectedAccount = await connectWallet();
        if (!connectedAccount) {
          throw new Error("Debe conectar su wallet para mintear animales");
        }
      }

      // 🚨 VALIDACIÓN: Asegurar que la imagen exista
      if (!formData.imagen) {
        throw new Error("La foto del animal es obligatoria.");
      }

      // 2. Subida de la Imagen a IPFS
      // formData.imagen YA NO PUEDE SER NULO gracias a la validación anterior
      // Asumimos que uploadFile devuelve SOLAMENTE el CID (ej: 'Qmg9og3zypdne')
      const imageCID = await uploadFile(formData.imagen);
      console.log("[v3] Imagen subida a IPFS (CID):", imageCID);

      // 3. Preparar Metadatos del Animal (OpenSea Standard)
      // imageCID ahora siempre es un string no vacío.
      const imageUri = `ipfs://${imageCID}`;

      const animalMetadata = {
        name: formData.nombre,
        description: `${formData.especie} - ${formData.raza}`,
        image: imageUri,
        attributes: [
          {
            trait_type: "Especie",
            value: formData.especie,
          },
          {
            trait_type: "Raza",
            value: formData.raza,
          },
          {
            trait_type: "Fecha de Nacimiento",
            value: formData.fechaNacimiento,
          },
          {
            trait_type: "Color",
            value: formData.color,
          },
          {
            trait_type: "Características",
            value: formData.caracteristicas,
          },
        ],
        properties: {
          chipId: formData.chipId,
          duenoAddress: formData.duenoAddress || account,
        },
      };

      // 4. Subir Metadatos JSON a IPFS
      const metadataCID = await uploadJSON(animalMetadata);

      // 5. Mintear NFT en la Blockchain
      const chipId = Number.parseInt(formData.chipId);
      // 5. Crear el primer registro medico automáticamente
      const medicalRecord = {
        chipId,
        fecha: new Date().toISOString(),
        diagnostico: "Se registro el animal en la blockchain.",
        tratamiento: "Se le asigno un chip de identificación.",
        medicamentos: [],
        notas: "Registro inicial automático.",
        veterinario: account,
      };

      const medicalRecordCID = await uploadJSON(medicalRecord);
      await mintAnimal(
        formData.duenoAddress || account,
        chipId,
        metadataCID,
        medicalRecordCID,
      );

      // Limpiar formulario...
      setFormData({
        nombre: "",
        especie: "",
        raza: "",
        fechaNacimiento: "",
        chipId: "",
        color: "",
        caracteristicas: "",
        duenoAddress: "",
        imagen: null,
      });
      setPreviewImage(null);

      if (onSuccess) {
        onSuccess(metadataCID, chipId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`Ocurrió un error: ${message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  const isLoading = web3Loading || ipfsLoading || uploading;

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Mintear Nuevo Animal</h2>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg text-primary">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nombre del Animal
          </label>
          <input
            type="text"
            placeholder="Ej: Luna"
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Especie</label>
          <select
            required
            value={formData.especie}
            onChange={(e) =>
              setFormData({ ...formData, especie: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar especie</option>
            <option value="OTRA">Otra</option>
            <option value="CANINA">Canina (Perros)</option>
            <option value="FELINA">Felina (Gatos)</option>
            <option value="BOVINA">Bovina (Vacas, Toros)</option>
            <option value="EQUINA">Equina (Caballos, Burros, Mulas)</option>
            <option value="PORCINA">Porcina (Cerdos)</option>
            <option value="OVINA">Ovina (Ovejas)</option>
            <option value="CAPRINA">Caprina (Cabras)</option>
            <option value="AVICOLA">Avícola (Aves de Corral)</option>
            <option value="PISCICOLA">Piscícola (Peces)</option>
            <option value="APICOLA">Apícola (Abejas)</option>
            <option value="CUNICOLA">Cunícola (Conejos)</option>
            <option value="EXOTICA_MASCOTA">
              Exótica Mascota (Reptiles, Hurones)
            </option>
            <option value="FAUNA_SILVESTRE">Fauna Silvestre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Raza</label>
          <input
            type="text"
            placeholder="Ej: Labrador"
            required
            value={formData.raza}
            onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            required
            value={formData.fechaNacimiento}
            onChange={(e) =>
              setFormData({ ...formData, fechaNacimiento: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Color/Descripción Física
          </label>
          <input
            type="text"
            placeholder="Ej: Marrón oscuro con manchas blancas"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Características Especiales
          </label>
          <textarea
            placeholder="Cicatrices, marcas especiales, etc."
            value={formData.caracteristicas}
            onChange={(e) =>
              setFormData({ ...formData, caracteristicas: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            ID del Chip (único)
          </label>
          <input
            type="number"
            placeholder="Ej: 123456"
            required
            value={formData.chipId}
            onChange={(e) =>
              setFormData({ ...formData, chipId: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Dirección del Dueño
          </label>
          <input
            type="text"
            placeholder="0x... (dejar en blanco para usar wallet actual)"
            value={formData.duenoAddress}
            onChange={(e) =>
              setFormData({ ...formData, duenoAddress: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Foto del Animal
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            {previewImage ? (
              <div className="space-y-2">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Preview"
                  className="h-32 w-32 mx-auto object-cover rounded-lg"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.imagen?.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, imagen: null });
                    setPreviewImage(null);
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <p className="text-muted-foreground">
                    Arrastra una imagen o haz click para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF (máx. 10MB)
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading ? "Procesando..." : "Mintear NFT del Animal"}
        </Button>
      </form>
    </Card>
  );
}
