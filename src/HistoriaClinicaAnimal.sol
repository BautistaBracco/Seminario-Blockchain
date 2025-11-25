// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CoreAnimal} from "./CoreAnimal.sol";
import {IColegioDeVeterinarios, IRegistroIdentidadAnimal} from "./Interfaces.sol";
import {EstadoSalud} from "./TiposAnimales.sol";

/**
 * @title HistoriaClinicaAnimal
 * @notice Gestiona historiales médicos
 */
contract HistoriaClinicaAnimal is CoreAnimal {
    struct RegistroMedico {
        uint256 fecha;
        string descripcion;
        address veterinario;
        EstadoSalud estadoSalud;
    }

    mapping(uint256 => RegistroMedico[]) private historialesMedicos;

    // ----------- Events -----------

    event RegistroMedicoAgregado(
        uint256 indexed chipId, uint256 fecha, address indexed veterinario, EstadoSalud estadoSalud
    );

    // ----------- Errores -----------

    error DescripcionVacia();

    constructor(address colegioDeVeterinariosAddr, address registroIdentidadAnimalAddr)
        CoreAnimal(colegioDeVeterinariosAddr, registroIdentidadAnimalAddr)
    {}

    function agregarRegistroMedico(uint256 chipId, string calldata descripcion, EstadoSalud estadoSalud)
        external
        soloVeterinarioAutorizado
        animalRegistrado(chipId)
    {
        if (bytes(descripcion).length == 0) {
            revert DescripcionVacia();
        }

        historialesMedicos[chipId].push(
            RegistroMedico({
                fecha: block.timestamp, descripcion: descripcion, veterinario: msg.sender, estadoSalud: estadoSalud
            })
        );

        emit RegistroMedicoAgregado(chipId, block.timestamp, msg.sender, estadoSalud);
    }

    function obtenerHistorialMedico(uint256 chipId)
        external
        view
        animalRegistrado(chipId)
        returns (RegistroMedico[] memory)
    {
        return historialesMedicos[chipId];
    }

    function obtenerUltimoRegistroMedico(uint256 chipId)
        public
        view
        animalRegistrado(chipId)
        returns (RegistroMedico memory)
    {
        RegistroMedico[] storage historial = historialesMedicos[chipId];
        require(historial.length > 0, "Sin registros medicos");
        return historial[historial.length - 1];
    }

    function obtenerEstadoSalud(uint256 chipId) external view animalRegistrado(chipId) returns (EstadoSalud) {
        RegistroMedico[] storage historial = historialesMedicos[chipId];
        require(historial.length > 0, "Sin registros medicos");
        return historial[historial.length - 1].estadoSalud;
    }
}

