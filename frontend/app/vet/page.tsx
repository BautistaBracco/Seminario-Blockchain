"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";
import { MedicalRecordForm } from "@/components/medical-record-form";
import { MintAnimalForm } from "@/components/mint-animal-form";
import { useRouter } from "next/navigation";
import { VeterinarianQR } from "@/components/veterinarian-qr";

export default function VeterinarianDashboard() {
  const [activeTab, setActiveTab] = useState<"mint" | "medical" | "qr">("mint");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 ">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                VetChain - Veterinario
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
              onClick={() => setActiveTab("mint")}
              variant={activeTab === "mint" ? "default" : "outline"}
              className={
                activeTab === "mint" ? "bg-primary hover:bg-primary/90" : ""
              }
            >
              Mintear Animal
            </Button>
            <Button
              onClick={() => setActiveTab("medical")}
              variant={activeTab === "medical" ? "default" : "outline"}
              className={
                activeTab === "medical"
                  ? "bg-secondary hover:bg-secondary/90"
                  : ""
              }
            >
              Agregar Registro Médico
            </Button>
            <Button
              onClick={() => setActiveTab("qr")}
              variant={activeTab === "qr" ? "default" : "outline"}
              className={
                activeTab === "qr" ? "bg-blue-600 hover:bg-blue-700" : ""
              }
            >
              Código QR
            </Button>
          </div>

          {activeTab === "mint" && <MintAnimalForm />}
          {activeTab === "medical" && <MedicalRecordForm />}
          {activeTab === "qr" && <VeterinarianQR />}
        </div>
      </main>
    </div>
  );
}
