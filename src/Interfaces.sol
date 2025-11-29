// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EstadoSalud} from "./TiposAnimales.sol";

interface IColegioDeVeterinarios {
    function tieneCredencialValida(address vet) external view returns (bool);
}

interface IHistoriaClinicaAnimal {
    function obtenerEstadoSalud(uint256 chipId) external view returns (EstadoSalud);
    function isVetAuthorized(address owner, address vetAddress) external view returns (bool);
    function authorizeVetOnMint(address owner, address vetAddress) external;
}

interface IRegistroIdentidadAnimal {
    function exists(uint256 chipId) external view returns (bool);
    function ownerOf(uint256 tokenId) external view returns (address);
}
