"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";
import { TransferAnimalForm } from "@/components/transfer-animal-form";
import { useParams, useSearchParams } from "next/navigation";

export default function TransferPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/owner">
                <Button variant="ghost" size="sm">
                  ← Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">
                Transferir {searchParams.get("name")}
              </h1>
            </div>
            <div className="flex gap-2">
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-2xl">
          <TransferAnimalForm
            chipId={params.id}
            petName={searchParams.get("name") || ""}
          />
        </div>
      </main>
    </div>
  );
}
