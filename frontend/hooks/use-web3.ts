"use client";

import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACTS, IPFS_GATEWAY, SEPOLIA_CHAIN_ID } from "@/lib/config";
import {
  EstadoSalud,
  MOCK_COLEGIO_ABI,
  HISTORIA_CLINICA_ABI,
  REGISTRO_IDENTIDAD_ABI,
} from "@/lib/abis";

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask no disponible");

    try {
      // Intentar cambiar a Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Si la red no está agregada (error 4902), agregarla
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "SEP",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
          params: [{ chainId: SEPOLIA_CHAIN_ID }], // 0xaa36a7 es el Chain ID de Sepolia en formato hexadecimal
        });

        if (!Array.isArray(accounts)) return;
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };

    checkConnection();

    // Listen for account changes
    window.ethereum?.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    });

    return () => {
      window.ethereum?.removeListener("accountsChanged", () => {});
    };
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask no instalado");
      }
      await switchToSepolia();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [{ chainId: SEPOLIA_CHAIN_ID }], // 0xaa36a7 es el Chain ID de Sepolia en formato hexadecimal
      });
      setAccount(accounts[0]);

      return accounts[0];
    } catch (err) {
      if (err instanceof Error && err.message.includes("User rejected")) {
        setError("Conexión cancelada");
      } else {
        setError("Error conectando wallet");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [switchToSepolia]);

  const getProvider = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask no disponible");
    await switchToSepolia();
    return new BrowserProvider(window.ethereum);
  }, [switchToSepolia]);

  const isVeterinarian = useCallback(async () => {
    try {
      if (!account) return false;
      const provider = await getProvider();
      const contract = new Contract(
        CONTRACTS.MockColegioDeVeterinarios,
        MOCK_COLEGIO_ABI,
        provider,
      );
      return await contract.tieneCredencialValida(account);
    } catch (err) {
      console.error("Error verificando veterinario:", err);
      return false;
    }
  }, [account, getProvider]);

  const mintAnimal = useCallback(
    async (to: string, chipId: number, cid: string) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.RegistroIdentidadAnimal,
          REGISTRO_IDENTIDAD_ABI,
          signer,
        );

        const tx = await contract.mint(to, chipId, cid);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error al mintear animal");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  const addMedicalRecord = useCallback(
    async (chipId: number, cid: string, estado: EstadoSalud) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          signer,
        );

        const tx = await contract.agregarRegistroMedico(chipId, cid, estado);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error agregando registro");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  const getMedicalHistory = useCallback(
    async (chipId: number) => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          provider,
        );
        const result = await contract.obtenerHistorialMedico(chipId);

        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.log(
          "[v0] getMedicalHistory error:",
          err instanceof Error ? err.message : "Unknown error",
        );
        return [];
      }
    },
    [getProvider],
  );

  const fetchFullMedicalHistory = useCallback(
    async (chipId: number): Promise<any[]> => {
      try {
        const cids = await getMedicalHistory(chipId);
        if (cids.length === 0) return [];

        const historyPromises = cids.map(async (cid) => {
          try {
            if (!cid) return null;

            const url = `${IPFS_GATEWAY}${cid}`;
            const response = await fetch(url);

            const json = await response.json();

            return {
              cid,
              ...json, // lo que venga del historial: fecha, vet, notas, etc.
            };
          } catch (err) {
            console.error(`Error procesando CID ${cid}`, err);
            return null;
          }
        });

        const results = await Promise.all(historyPromises);

        return results.filter((item) => item !== null);
      } catch (err) {
        console.error("fetchFullMedicalHistory error", err);
        return [];
      }
    },
    [getMedicalHistory],
  );

  const getAnimalHealth = useCallback(
    async (chipId: number) => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          provider,
        );
        const result = await contract.obtenerEstadoSalud(chipId);
        return typeof result === "number" ? result : 0;
      } catch (err) {
        console.log(
          "[v0] getAnimalHealth error:",
          err instanceof Error ? err.message : "Unknown error",
        );
        return 0;
      }
    },
    [getProvider],
  );

  const transferAnimal = useCallback(
    async (from: string, to: string, chipId: number) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.RegistroIdentidadAnimal,
          REGISTRO_IDENTIDAD_ABI,
          signer,
        );

        const tx = await contract.transferFrom(from, to, chipId);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error transferiendo");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  // 1. Obtiene los IDs de los tokens (chipId) del dueño. (ERC-721 Enumerable)
  const getOwnedAnimalIDs = useCallback(async () => {
    try {
      if (!account) return [];

      const provider = await getProvider();
      const contract = new Contract(
        CONTRACTS.RegistroIdentidadAnimal,
        REGISTRO_IDENTIDAD_ABI,
        provider,
      );

      const balance = await contract.balanceOf(account);
      const numAnimals = Number(balance);

      if (numAnimals === 0) return [];

      const animalIds: number[] = [];
      for (let i = 0; i < numAnimals; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        const token = Number(tokenId);
        animalIds.push(token);
      }

      return animalIds;
    } catch (err) {
      console.error("[v1] getOwnedAnimalIDs error:", err);
      return [];
    }
  }, [account, getProvider]);
  // ----------------------------------------------------------------------
  // 2. FUNCIÓN CONSOLIDADA: Obtiene URI, descarga JSON y devuelve metadatos completos.
  const fetchFullAnimalDetails = useCallback(
    async (chipIds: number[]): Promise<any[]> => {
      if (chipIds.length === 0) return [];

      const provider = await getProvider();
      const contractIdentidad = new Contract(
        CONTRACTS.RegistroIdentidadAnimal,
        REGISTRO_IDENTIDAD_ABI,
        provider,
      );
      const contractRegistroMedico = new Contract(
        CONTRACTS.HistoriaClinicaAnimal,
        HISTORIA_CLINICA_ABI,
        provider,
      );

      // Mapea cada chipId a una promesa para obtener sus detalles
      const detailPromises = chipIds.map(async (chipId) => {
        try {
          // a. Llama al contrato para obtener la URI (on-chain)
          const uri = await contractIdentidad.tokenURI(chipId);
          const estadoDeSalud: EstadoSalud =
            await contractRegistroMedico.obtenerEstadoSalud(chipId);

          if (!uri || !uri.startsWith("ipfs://")) {
            throw new Error("URI de IPFS inválida.");
          }

          // b. Construye la URL de acceso (off-chain)
          const cid = uri.replace("ipfs://", "");
          const fetchUrl = `${IPFS_GATEWAY}${cid}`;

          // c. Descarga y parsea el JSON (off-chain HTTP)
          const response = await fetch(fetchUrl);

          //if (!response.ok) {
          //  throw new Error(`Error HTTP: ${response.statusText}`);
          //}

          const metadata = await response.json();

          // d. Retorna el chipId junto con el contenido de los metadatos
          return {
            chipId,
            ...metadata, // name, description, image, attributes, etc.
            estadoDeSalud:Number(estadoDeSalud),
          };
        } catch (err) {
          console.error(`Error al procesar chipId ${chipId}:`, err);
          return null; // Fallo gracioso: el animal no se incluirá en el resultado final
        }
      });

      // Espera a que todas las peticiones se resuelvan concurrentemente
      const results = await Promise.all(detailPromises);

      // Filtra los fallos (valores 'null') antes de retornar
      return results.filter((detail) => detail !== null);
    },
    [getProvider],
  );

  const setOwnerEnabled = useCallback(
    async (owner: string, enabled: boolean) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.RegistroIdentidadAnimal,
          REGISTRO_IDENTIDAD_ABI,
          signer,
        );

        const tx = await contract.setOwnerEnabled(owner, enabled);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error al actualizar dueño");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  const authorizeVeterinarian = useCallback(
    async (vetAddress: string) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          signer,
        );

        const tx = await contract.authorizeVeterinarian(vetAddress);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error autorizando veterinario");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  const revokeVeterinarian = useCallback(
    async (vetAddress: string) => {
      try {
        setLoading(true);
        setError(null);

        const provider = await getProvider();
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          signer,
        );

        const tx = await contract.revokeVeterinarian(vetAddress);
        await tx.wait();

        return tx.hash;
      } catch (err) {
        if (err instanceof Error && err.message.includes("User denied")) {
          setError("Transacción cancelada");
        } else {
          setError("Error revocando veterinario");
        }
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getProvider],
  );

  const getAuthorizedVeterinarians = useCallback(
    async (owner: string) => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          provider,
        );
        const result = await contract.obtenerVeterinariosAutorizados(owner);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.log(
          "[v0] getAuthorizedVeterinarians error:",
          err instanceof Error ? err.message : "Unknown error",
        );
        return [];
      }
    },
    [getProvider],
  );

  const isVetAuthorized = useCallback(
    async (owner: string, vetAddress: string) => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          CONTRACTS.HistoriaClinicaAnimal,
          HISTORIA_CLINICA_ABI,
          provider,
        );
        return await contract.isVetAuthorized(owner, vetAddress);
      } catch (err) {
        console.log(
          "[v0] isVetAuthorized error:",
          err instanceof Error ? err.message : "Unknown error",
        );
        return false;
      }
    },
    [getProvider],
  );

  return {
    account,
    isConnected: account !== null,
    loading,
    error,
    connectWallet,
    isVeterinarian,
    mintAnimal,
    addMedicalRecord,
    fetchFullMedicalHistory,
    getAnimalHealth,
    transferAnimal,
    getOwnedAnimalIDs,
    fetchFullAnimalDetails,
    setOwnerEnabled,
    authorizeVeterinarian,
    revokeVeterinarian,
    getAuthorizedVeterinarians,
    isVetAuthorized,
  };
}
