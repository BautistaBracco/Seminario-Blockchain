// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockColegioDeVeterinarios
 * @notice Contrato mock para desarrollo y pruebas locales.
 * Permite configurar manualmente qué direcciones tienen credencial válida.
 */
contract MockColegioDeVeterinarios {
    mapping(address => bool) private credenciales;

    event VeterinarioHabilitado(address vet);
    event VeterinarioDeshabilitado(address vet);

    /**
     * @dev Agrega un veterinario con credencial válida (solo para testing).
     */
    function habilitarVeterinario(address vet) external {
        credenciales[vet] = true;
        emit VeterinarioHabilitado(vet);
    }

    /**
     * @dev Revoca la credencial del veterinario.
     */
    function deshabilitarVeterinario(address vet) external {
        credenciales[vet] = false;
        emit VeterinarioDeshabilitado(vet);
    }

    /**
     * @dev Implementación del método requerido por la interfaz.
     */
    function tieneCredencialValida(address vet) external view returns (bool) {
        return credenciales[vet];
    }
}

