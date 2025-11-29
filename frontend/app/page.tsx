"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className=" w-full">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">VetChain</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Registro de Identidad Animal en Blockchain
          </p>
          <p className="text-muted-foreground">
            Gestiona la salud y el historial médico de tus animales de forma
            segura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          <Card
            className="p-8 border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={async () => {
              try {
                if (!window.ethereum) {
                  alert("Por favor instala MetaMask");
                  return;
                }
                await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
              } catch (err) {
                console.log("Conexión cancelada");
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-2xl mb-4">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Veterinario</h2>
              <p className="text-muted-foreground mb-6">
                Mintea NFTs, registra datos del animal y carga registros médicos
                en IPFS
              </p>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => router.push("/vet")}
              >
                Acceder como Veterinario
              </Button>
            </div>
          </Card>

          <Card
            className="p-8 border-2 border-secondary/20 hover:border-secondary/50 transition-colors cursor-pointer"
            onClick={async () => {
              try {
                if (!window.ethereum) {
                  alert("Por favor instala MetaMask");
                  return;
                }
                await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
              } catch (err) {
                console.log("Conexión cancelada");
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-secondary/10 p-4 rounded-2xl mb-4">
                <svg
                  className="w-12 h-12 text-secondary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Dueño del Animal</h2>
              <p className="text-muted-foreground mb-6">
                Visualiza tus mascotas, historial médico y realiza
                transferencias
              </p>
              <Button
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={() => router.push("/owner")}
              >
                Acceder como Dueño
              </Button>
            </div>
          </Card>
          <Card
            className="p-8 border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer"
            onClick={async () => {
              try {
                if (!window.ethereum) {
                  alert("Por favor instala MetaMask");
                  return;
                }
                await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
              } catch (err) {
                console.log("Conexión cancelada");
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-2xl mb-4">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.29 7.78-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Encargado de Identidad
              </h2>
              <p className="text-muted-foreground mb-6">
                Gestiona dueños habilitados para recibir y transferir animales
              </p>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => router.push("/identity-manager")}
              >
                Acceder como Encargado
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
