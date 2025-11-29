export const MOCK_COLEGIO_ABI = [
  {
    type: "function",
    name: "habilitarVeterinario",
    inputs: [{ name: "vet", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tieneCredencialValida",
    inputs: [{ name: "vet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const HISTORIA_CLINICA_ABI = [
  {
    type: "function",
    name: "agregarRegistroMedico",
    inputs: [
      { name: "chipId", type: "uint256" },
      { name: "cid", type: "string" },
      { name: "nuevoEstado", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "obtenerHistorialMedico",
    inputs: [{ name: "chipId", type: "uint256" }],
    outputs: [{ name: "", type: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "obtenerEstadoSalud",
    inputs: [{ name: "chipId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "authorizeVeterinarian",
    inputs: [{ name: "vetAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeVeterinarian",
    inputs: [{ name: "vetAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "obtenerVeterinariosAutorizados",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isVetAuthorized",
    inputs: [
      { name: "owner", type: "address" },
      { name: "vetAddress", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const REGISTRO_IDENTIDAD_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "chipId", type: "uint256" },
      { name: "animalCid", type: "string" },
      { name: "firstReportCid", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setOwnerEnabled",
    inputs: [
      { name: "owner", type: "address" },
      { name: "enabled", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;
export enum EstadoSalud {
  SANO = 0,
  ENFERMO = 1,
  FALLECIDO = 2,
}
