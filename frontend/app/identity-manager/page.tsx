"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { OwnerManagerForm } from "@/components/owner-manager-form";

export default function IdentityManagerDashboard() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-amber-100/50 to-amber-50 ">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.29 7.78-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                VetChain - Encargado de Identidad
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
        <div className="grid md:grid-cols-2 gap-6 mb-8"></div>

        <OwnerManagerForm />
      </main>
    </div>
  );
}
