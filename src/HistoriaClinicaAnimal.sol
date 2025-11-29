// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IColegioDeVeterinarios, IRegistroIdentidadAnimal} from "./Interfaces.sol";
import {EstadoSalud} from "./TiposAnimales.sol";

/**
 * @title HistoriaClinicaAnimal
 * @notice Guarda únicamente referencias IPFS (CID). Sin structs on-chain.
 */
contract HistoriaClinicaAnimal is Ownable {
    IColegioDeVeterinarios public colegioDeVeterinarios;
    IRegistroIdentidadAnimal public registroIdentidadAnimal;

    // CIDs de cada registro médico, totalmente off-chain
    mapping(uint256 => string[]) private historiales;

    // Estado de salud actual (opcional, si querés tenerlo rápido en cadena)
    mapping(uint256 => EstadoSalud) private estadoActual;

    // Dueños que autorizaron a veterinarios para generar registros médicos de todos sus animales
    mapping(address => mapping(address => bool)) private vetAuthorized;

    // Lista de veterinarios autorizados por cada dueño
    mapping(address => address[]) private vetList;

    event RegistroMedicoAgregado(
        uint256 indexed chipId, string cid, uint256 fecha, address indexed veterinario, EstadoSalud estadoSalud
    );

    // El registro de identidad animal debe estar seteado después del deploy
    constructor(address colegioDeVeterinariosAddr) Ownable(msg.sender) {
        require(colegioDeVeterinariosAddr != address(0), "Direccion colegio invalida");
        colegioDeVeterinarios = IColegioDeVeterinarios(colegioDeVeterinariosAddr);
    }

    function setRegistroIdentidadAnimal(address nuevaDireccion) external onlyOwner {
        require(nuevaDireccion != address(0), "Direccion invalida");
        registroIdentidadAnimal = IRegistroIdentidadAnimal(nuevaDireccion);
    }

    function setColegioDeVeterinarios(address nuevaDireccion) external onlyOwner {
        require(nuevaDireccion != address(0), "Direccion invalida");
        colegioDeVeterinarios = IColegioDeVeterinarios(nuevaDireccion);
    }

    /**
     * @notice Agrega un registro médico cuyo contenido completo está en IPFS
     */
    function agregarRegistroMedico(uint256 chipId, string calldata cid, EstadoSalud nuevoEstado) external {
        require(bytes(cid).length > 0, "CID no puede ser vacio");
        require(colegioDeVeterinarios.tieneCredencialValida(msg.sender), "Veterinario no autorizado");
        require(registroIdentidadAnimal.exists(chipId), "Animal no registrado");
        require(
            isVetAuthorized(registroIdentidadAnimal.ownerOf(chipId), msg.sender),
            "Veterinario no autorizado para este animal"
        );

        historiales[chipId].push(cid);
        estadoActual[chipId] = nuevoEstado;

        emit RegistroMedicoAgregado(chipId, cid, block.timestamp, msg.sender, nuevoEstado);
    }

    /**
     * @return Lista completa de CIDs del historial médico
     */
    function obtenerHistorialMedico(uint256 chipId) external view returns (string[] memory) {
        require(registroIdentidadAnimal.exists(chipId), "Animal no registrado");
        return historiales[chipId];
    }

    /**
     * @return CID del último registro médico
     */
    function obtenerUltimoRegistroCid(uint256 chipId) external view returns (string memory) {
        require(registroIdentidadAnimal.exists(chipId), "Animal no registrado");

        string[] storage h = historiales[chipId];
        require(h.length > 0, "Sin historial");

        return h[h.length - 1];
    }

    /**
     * @return Estado de salud actual (on-chain)
     */
    function obtenerEstadoSalud(uint256 chipId) external view returns (EstadoSalud) {
        require(registroIdentidadAnimal.exists(chipId), "Animal no registrado");
        return estadoActual[chipId];
    }

    // Autoriza un veterinario automáticamente al momento de mintear el animal
    function authorizeVetOnMint(address owner, address vetAddress) external {
        require(msg.sender == address(registroIdentidadAnimal), "Solo RegistroIdentidadAnimal");
        require(colegioDeVeterinarios.tieneCredencialValida(vetAddress), "Veterinario no autorizado");

        if (!vetAuthorized[owner][vetAddress]) {
            vetAuthorized[owner][vetAddress] = true;
            vetList[owner].push(vetAddress);
        }
    }

    function authorizeVeterinarian(address vetAddress) external {
        require(colegioDeVeterinarios.tieneCredencialValida(vetAddress), "Veterinario no autorizado");

        if (!vetAuthorized[msg.sender][vetAddress]) {
            vetAuthorized[msg.sender][vetAddress] = true;
            vetList[msg.sender].push(vetAddress);
        }
    }

    function revokeVeterinarian(address vetAddress) external {
        require(vetAuthorized[msg.sender][vetAddress], "No estaba autorizado");

        vetAuthorized[msg.sender][vetAddress] = false;

        // borrar del array
        address[] storage list = vetList[msg.sender];
        uint256 len = list.length;

        for (uint256 i = 0; i < len; i++) {
            if (list[i] == vetAddress) {
                list[i] = list[len - 1];
                list.pop();
                break;
            }
        }
    }

    function isVetAuthorized(address owner, address vetAddress) public view returns (bool) {
        return vetAuthorized[owner][vetAddress];
    }

    function obtenerVeterinariosAutorizados(address owner) external view returns (address[] memory) {
        return vetList[owner];
    }
}

