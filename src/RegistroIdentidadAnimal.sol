// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EstadoSalud} from "./TiposAnimales.sol";
import {IHistoriaClinicaAnimal, IColegioDeVeterinarios} from "./Interfaces.sol";

contract RegistroIdentidadAnimal is ERC721Enumerable, Ownable {
    mapping(uint256 => string) private _tokenCIDs;
    mapping(address => bool) public ownerEnabled;

    IHistoriaClinicaAnimal public registroMedico;
    IColegioDeVeterinarios public colegioDeVeterinarios;

    constructor(address colegioDeVeterinariosAddr, address registroMedicosAddr)
        ERC721("Registro Animal Argentino", "RAA")
        Ownable(msg.sender)
    {
        require(colegioDeVeterinariosAddr != address(0), "Direccion colegio invalida");
        require(registroMedicosAddr != address(0), "Direccion registro medico invalida");
        registroMedico = IHistoriaClinicaAnimal(registroMedicosAddr);
        colegioDeVeterinarios = IColegioDeVeterinarios(colegioDeVeterinariosAddr);
    }

    /// @notice Crea un nuevo animal (NFT) asociado a un chip único.
    /// @dev Solo veterinarios habilitados pueden mintear.
    function mint(address to, uint256 chipId, string calldata cid) external {
        // --- Validaciones baratas ---
        require(chipId != 0, "ChipID invalido");
        require(to != address(0), "Direccion destino invalida");
        require(bytes(cid).length > 0, "CID no puede estar vacio");

        require(colegioDeVeterinarios.tieneCredencialValida(msg.sender), "Solo veterinarios habilitados pueden mintear");

        // --- Estado ---
        require(_ownerOf(chipId) == address(0), "Chip ya registrado");
        require(ownerEnabled[to], "Destinatario no habilitado");

        // --- Mint del NFT ---
        _safeMint(to, chipId);
        _tokenCIDs[chipId] = cid;
        registroMedico.authorizeVetOnMint(to, msg.sender);
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
            require(
                registroMedico.obtenerEstadoSalud(tokenId) == EstadoSalud.SANO, "Animal no sano, no se puede transferir"
            );
        }

        return super._update(to, tokenId, auth);
    }

    /// @notice Habilita o deshabilita un dueño para recibir o transferir animales
    function setOwnerEnabled(address owner, bool enabled) external onlyOwner {
        ownerEnabled[owner] = enabled;
    }

    /// @notice Retorna el URI del token basado en su CID almacenado
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory cid = _tokenCIDs[tokenId];
        require(bytes(cid).length > 0, "CID no asignado");

        return string.concat("ipfs://", cid);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

