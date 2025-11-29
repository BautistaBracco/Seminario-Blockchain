"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import { CONTRACTS, SEPOLIA_CHAIN_ID } from "@/lib/config";

// *** CONFIGURACIÓN DEL SMART CONTRACT (REEMPLAZA ESTOS VALORES) ***
const FUNCTION_NAME = "authorizeVeterinarian"; // Función del SC a llamar
// *******************************************************************

export function VeterinarianQR() {
  const { account } = useWeb3();

  // 1. GENERACIÓN DEL URI EIP-681
  const qrValue = useMemo(() => {
    if (!account) {
      // Si no está conectado, el QR no puede generarse con un valor útil
      return "not-connected";
    }

    // El primer parámetro de la función 'authorizeVeterinarian' es la dirección del veterinario.
    const functionParams = `param-0=${account}`;

    const uri = `ethereum:${CONTRACTS.HistoriaClinicaAnimal}@${SEPOLIA_CHAIN_ID}/${FUNCTION_NAME}?${functionParams}`;
    console.log(uri);
    return uri;
  }, [account]);

  const isConnected = !!account;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Código QR de Autorización 🩺
        </h3>
        <p className="text-sm text-muted-foreground">
          Comparte este código para que los dueños de mascotas puedan
          autorizarte a través de la función **`{FUNCTION_NAME}`** en el Smart
          Contract.
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div className="flex flex-col items-center gap-6">
          {/* 2. IMPLEMENTACIÓN REAL DEL QR */}
          {isConnected ? (
            <div className="w-48 h-48  bg-white border-4 border-primary rounded-lg flex justify-center items-center shadow-lg">
              <QRCodeSVG
                value={qrValue} // Usa el URI EIP-681 como valor
                size={176} // Ajusta el tamaño para que encaje bien en el contenedor (48x48 rem)
                level="M" // Nivel de corrección de errores (M es bueno)
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          ) : (
            // Mostrar estado "No Conectado" si no hay cuenta
            <div className="w-48 h-48 bg-white border-4 border-dashed border-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <div className="text-center p-2">
                <QrCode className="w-24 h-24 text-red-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-red-500 font-semibold">
                  CONECTA TU WALLET
                </p>
              </div>
            </div>
          )}

          {/* Address Display */}
          <div className="w-full space-y-3">
            <p className="text-sm font-semibold text-foreground text-center">
              Tu Dirección de Veterinario
            </p>
          </div>

          {/* Instructions */}
          <Card className="w-full p-4 bg-secondary/5 border-secondary/20">
            <h4 className="font-semibold text-sm text-foreground mb-2">
              Instrucciones para el Dueño de la Mascota:
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                **Escanea** el código QR con la aplicación **MetaMask** Móvil.
              </li>
              <li>
                MetaMask identificará la llamada a la función **`{FUNCTION_NAME}
                `**.
              </li>
              <li>
                El dueño deberá **confirmar** la transacción (pagando el gas).
              </li>
              <li>
                Una vez confirmada, quedas **autorizado** en el Smart Contract.
              </li>
            </ol>
          </Card>
        </div>
      </Card>
    </div>
  );
}
