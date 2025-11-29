"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WalletButton } from "@/components/wallet-button";
import { PetCard, type Pet } from "@/components/pet-card";
import { useWeb3 } from "@/hooks/use-web3";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const { getOwnedAnimalIDs, fetchFullAnimalDetails, isConnected, account } =
    useWeb3();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pets" | "vets">("pets");

  useEffect(() => {
    const fetchAllData = async () => {
      if (!isConnected || !account) {
        setPets([]);
        return;
      }

      setLoading(true);

      try {
        // PASO 1: Obtener la lista de IDs desde el contrato
        const chipIds = await getOwnedAnimalIDs();

        // PASO 2: Obtener los metadatos completos y parseados
        const detailedData = await fetchFullAnimalDetails(chipIds);
				console.log('Datos detallados obtenidos:', detailedData);


        setPets(detailedData);
      } catch (err) {
        console.error("Error durante la obtención de datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isConnected, account, getOwnedAnimalIDs, fetchFullAnimalDetails]);

  useEffect(() => {
    console.log("Mascotas cargadas:", pets);
  }, [pets]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-secondary/10 to-primary/10 ">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-secondary to-primary p-2 rounded-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                VetChain - Mis Mascotas
              </h1>
            </div>
            <div className="flex gap-2">
              <WalletButton />
              <Button variant="ghost" onClick={() => router.push("/")}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab("pets")}
              variant={activeTab === "pets" ? "default" : "outline"}
              className={
                activeTab === "pets" ? "bg-primary hover:bg-primary/90" : ""
              }
            >
              Mis Mascotas
            </Button>
            <Button
              onClick={() => setActiveTab("vets")}
              variant={activeTab === "vets" ? "default" : "outline"}
              className={
                activeTab === "vets" ? "bg-secondary hover:bg-secondary/90" : ""
              }
            >
              Mis Veterinarios
            </Button>
          </div>

          {activeTab === "pets" && (
            <OwnerPets isLoading={loading} pets={pets} />
          )}
          {activeTab === "vets" && <AuthorizedVetsList />}
        </div>
      </main>
    </div>
  );
}

function OwnerPets({ pets, isLoading }: { pets: Pet[]; isLoading: boolean }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Mis Mascotas</h2>
      <h3 className="text-sm text-muted-foreground mb-6">
        Aquí puedes ver todas las mascotas que has registrado en el sistema
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card className="p-8 text-center flex justify-center">
            <p className="text-muted-foreground">Cargando mascotas...</p>
          </Card>
        ) : pets.length === 0 ? (
          <Card className="p-8 text-center border-dashed col-span-full">
            <svg
              className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33
8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
              />
            </svg>
            <p className="text-muted-foreground">
              No has registrado ninguna mascota aún
            </p>
          </Card>
        ) : (
          pets.map((pet) => (
            <PetCard
              id={pet.properties.chipId}
              key={pet.properties.chipId}
              pet={pet}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AuthorizedVet {
  address: string;
  name?: string;
  specialties?: string[];
}

export function AuthorizedVetsList() {
  const { account, getAuthorizedVeterinarians, revokeVeterinarian, loading } =
    useWeb3();
  const [vets, setVets] = useState<AuthorizedVet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revokeInProgress, setRevokeInProgress] = useState<string | null>(null);
  const [revokingError, setRevokingError] = useState<string | null>(null);

  useEffect(() => {
    const loadVeterinarians = async () => {
      if (!account) return;

      setIsLoading(true);
      try {
        const authorizedVets = await getAuthorizedVeterinarians(account);
        const vetsList: AuthorizedVet[] = authorizedVets.map(
          (vetAddress: string) => ({
            address: vetAddress,
            name: `Veterinario ${vetAddress.slice(0, 6)}...${vetAddress.slice(-4)}`,
          }),
        );
        setVets(vetsList);
      } catch (err) {
        console.log("[v0] Error loading veterinarians:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVeterinarians();
  }, [account, getAuthorizedVeterinarians]);

  const handleRevoke = async (vetAddress: string) => {
    if (!confirm(`¿Deseas revocar la autorización de este veterinario?`))
      return;

    setRevokeInProgress(vetAddress);
    setRevokingError(null);

    try {
      await revokeVeterinarian(vetAddress);
      setVets(vets.filter((v) => v.address !== vetAddress));
    } catch (err) {
      setRevokingError("Error revocando veterinario");
      console.log("[v0] Revoke error:", err);
    } finally {
      setRevokeInProgress(null);
    }
  };

  if (!account) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground">
          Conecta tu wallet para ver veterinarios autorizados
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Veterinarios Autorizados
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Estos son los veterinarios que pueden ver y actualizar el historial
          médico de tus mascotas
        </p>
      </div>

      {revokingError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {revokingError}
        </div>
      )}

      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cargando veterinarios...</p>
        </Card>
      ) : (
        <div className="flex gap-4">
          {vets.map((vet) => (
            <Card
              key={vet.address}
              className="p-4 border-primary/20 hover:border-primary/50 transition-colors flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{vet.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {vet.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(vet.address)}
                  disabled={revokeInProgress === vet.address || loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  {revokeInProgress === vet.address
                    ? "Revocando..."
                    : "Revocar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && vets.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <svg
            className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <p className="text-muted-foreground">
            No hay veterinarios autorizados aún
          </p>
        </Card>
      )}
    </div>
  );
}
