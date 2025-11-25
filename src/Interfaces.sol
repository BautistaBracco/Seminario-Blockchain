// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EstadoSalud} from "./TiposAnimales.sol";

interface IColegioDeVeterinarios {
    function tieneCredencialValida(address vet) external view returns (bool);
}

interface IHistoriaClinicaAnimal {
    function obtenerEstadoSalud(uint256 chipId) external view returns (EstadoSalud);
}

interface IRegistroDeVacunacionAnimal {
    function tieneTodasVacunas(uint256 chipId) external view returns (bool);
}

interface IRegistroIdentidadAnimal {
	function exists(uint256 chipId) external view returns (bool);
}
