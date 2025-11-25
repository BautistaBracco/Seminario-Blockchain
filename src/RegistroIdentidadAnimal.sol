// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {CoreAnimal} from "./CoreAnimal.sol";
import {Animal, Especie, Sexo, EstadoSalud} from "./TiposAnimales.sol";
import {IRegistroDeVacunacionAnimal, IHistoriaClinicaAnimal} from "./Interfaces.sol";

contract RegistroIdentidadAnimal is ERC721, CoreAnimal {
    string private _baseTokenURI;

    mapping(uint256 => Animal) public animals;
    mapping(address => bool) public ownerEnabled;

    IRegistroDeVacunacionAnimal public registroVacunacion;
    IHistoriaClinicaAnimal public registroMedico;

    constructor(
        string memory baseURI,
        address colegioDeVeterinariosAddr,
        address registroMedicosAddr,
        address registroVacunacionAddr
    ) ERC721("Registro Animal Argentino", "RAA") CoreAnimal(colegioDeVeterinariosAddr, address(this)) {
        _baseTokenURI = baseURI;
        registroVacunacion = IRegistroDeVacunacionAnimal(registroVacunacionAddr);
        registroMedico = IHistoriaClinicaAnimal(registroMedicosAddr);
    }

    // @notice Permite actualizar la direccion del Registro de Vacunacion
    function setRegistroDeVacunacion(address addr) external onlyOwner {
        registroVacunacion = IRegistroDeVacunacionAnimal(addr);
    }

    /// @notice Crea un nuevo animal (NFT) asociado a un chip único.
    /// @dev Solo veterinarios habilitados pueden mintear.
    function mint(address to, uint256 chipId, Especie especie, uint256 nacimiento, Sexo sexo)
        external
        soloVeterinarioAutorizado
    {
        // --- Validaciones baratas ---
        require(chipId != 0, "ChipID invalido");
        require(to != address(0), "Direccion destino invalida");

        // --- Estado ---
        require(_ownerOf(chipId) == address(0), "Chip ya registrado");
        require(ownerEnabled[to], "Destinatario no habilitado");

        // --- Mint del NFT ---
        _safeMint(to, chipId);

        // --- Registrar metadatos del animal ---
        animals[chipId] = Animal({especie: especie, nacimiento: nacimiento, sexo: sexo});
    }

    /// @notice Hook universal usado para validar transferencias (no mint/burn)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Mint → from = 0  / Burn → to = 0
        if (from != address(0) && to != address(0)) {
            // 1. Dueño actual debe estar habilitado
            require(ownerEnabled[from], "Owner no habilitado");
            // 2. Nuevo dueño debe estar habilitado
            require(ownerEnabled[to], "Destinatario no habilitado");

            // 3. Validaciones médicas (desde el otro contrato)
            require(registroMedico.obtenerEstadoSalud(tokenId) == EstadoSalud.SANO, "El animal debe estar sano");
            require(registroVacunacion.tieneTodasVacunas(tokenId), "Animal no vacunado");
        }

        return super._update(to, tokenId, auth);
    }

    /// @notice Habilita o deshabilita un dueño para recibir o transferir animales
    function setOwnerEnabled(address owner, bool enabled) external onlyOwner {
        ownerEnabled[owner] = enabled;
    }

    /// @notice Devuelve el baseURI para tokenURI()
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Permite actualizar el baseURI
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
}

