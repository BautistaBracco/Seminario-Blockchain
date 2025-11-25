// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IColegioDeVeterinarios, IRegistroIdentidadAnimal} from "./Interfaces.sol";

abstract contract CoreAnimal is Ownable {
    // Declaraciones de Interfaces
    IColegioDeVeterinarios public colegioDeVeterinarios;
    IRegistroIdentidadAnimal public registroIdentidadAnimal;

    // Errores comunes
    error DireccionInvalida(string nombre);
    error AnimalNoRegistrado(uint256 chipId);
    error VeterinarioNoAutorizado(address veterinario);

    // Constructor base que inicializa las dependencias
    constructor(address _colegioDeVeterinariosAddr, address _registroIdentidadAnimalAddr) Ownable(msg.sender) {
        if (_colegioDeVeterinariosAddr == address(0)) revert DireccionInvalida("Colegio Veterinarios");
        if (_registroIdentidadAnimalAddr == address(0)) revert DireccionInvalida("Registro Identidad Animal");

        colegioDeVeterinarios = IColegioDeVeterinarios(_colegioDeVeterinariosAddr);
        registroIdentidadAnimal = IRegistroIdentidadAnimal(_registroIdentidadAnimalAddr);
    }

    // Modificadores Comunes
    modifier soloVeterinarioAutorizado() {
        if (!colegioDeVeterinarios.tieneCredencialValida(msg.sender)) {
            revert VeterinarioNoAutorizado(msg.sender);
        }
        _;
    }

    modifier animalRegistrado(uint256 chipId) {
        // Asumiendo que IRegistroIdentidadAnimal tiene la función exists()
        if (!registroIdentidadAnimal.exists(chipId)) {
            revert AnimalNoRegistrado(chipId);
        }
        _;
    }

    // Funciones de actualización de direcciones (administrativas)
    function actualizarColegioVeterinarios(address nuevaDireccion) external onlyOwner {
        if (nuevaDireccion == address(0)) revert DireccionInvalida("Colegio Veterinarios");
        colegioDeVeterinarios = IColegioDeVeterinarios(nuevaDireccion);
    }

    function actualizarRegistroIdentidad(address nuevaDireccion) external onlyOwner {
        if (nuevaDireccion == address(0)) revert DireccionInvalida("Registro Identidad Animal");
        registroIdentidadAnimal = IRegistroIdentidadAnimal(nuevaDireccion);
    }
}
