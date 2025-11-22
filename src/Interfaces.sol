// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IColegioDeVeterinarios {
    function tieneCredencialValida(address vet) external view returns (bool);
}

interface IRegistroMedico {
    function estaVivo(uint256 chipId) external view returns (bool);
    function estaEnfermo(uint256 chipId) external view returns (bool);
    function tieneTodasLasVacunas(uint256 chipId) external view returns (bool);
}
