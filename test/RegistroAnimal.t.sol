// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RegistroAnimal} from "../src/RegistroAnimal.sol";
import {Especie, Sexo} from "../src/TiposAnimales.sol";

// Mocks de las interfaces
contract MockColegioDeVeterinarios {
    mapping(address => bool) public veterinarios;

    function setVeterinario(address vet, bool habilitado) external {
        veterinarios[vet] = habilitado;
    }

    function tieneCredencialValida(address vet) external view returns (bool) {
        return veterinarios[vet];
    }
}

contract MockRegistroMedico {
    mapping(uint256 => bool) public vivo;
    mapping(uint256 => bool) public enfermo;
    mapping(uint256 => bool) public vacunado;

    function setEstadoAnimal(uint256 chipId, bool _vivo, bool _enfermo, bool _vacunado) external {
        vivo[chipId] = _vivo;
        enfermo[chipId] = _enfermo;
        vacunado[chipId] = _vacunado;
    }

    function estaVivo(uint256 chipId) external view returns (bool) {
        return vivo[chipId];
    }

    function estaEnfermo(uint256 chipId) external view returns (bool) {
        return enfermo[chipId];
    }

    function tieneTodasLasVacunas(uint256 chipId) external view returns (bool) {
        return vacunado[chipId];
    }
}

contract RegistroAnimalTest is Test {
    RegistroAnimal public registro;
    MockColegioDeVeterinarios public colegio;
    MockRegistroMedico public registroMedico;

    address public owner = address(1);
    address public veterinario = address(2);
    address public dueno1 = address(3);
    address public dueno2 = address(4);
    address public noAutorizado = address(5);

    uint256 public constant CHIP_1 = 123456789;
    uint256 public constant CHIP_2 = 987654321;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mocks
        colegio = new MockColegioDeVeterinarios();
        registroMedico = new MockRegistroMedico();

        // Deploy contrato principal
        registro = new RegistroAnimal("https://api.example.com/metadata/", address(colegio), address(registroMedico));

        // Configurar veterinario habilitado
        colegio.setVeterinario(veterinario, true);

        // Habilitar dueños
        registro.setOwnerEnabled(dueno1, true);
        registro.setOwnerEnabled(dueno2, true);

        vm.stopPrank();
    }

    // ========================================
    // Tests de Mint
    // ========================================

    function test_MintExitoso() public {
        vm.startPrank(veterinario);

        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        assertEq(registro.ownerOf(CHIP_1), dueno1);

        (Especie especie, uint256 nacimiento, Sexo sexo) = registro.animals(CHIP_1);
        assertEq(uint256(especie), uint256(Especie.CANINA));
        assertEq(nacimiento, block.timestamp);
        assertEq(uint256(sexo), uint256(Sexo.MACHO));

        vm.stopPrank();
    }

    function test_RevertMintChipIdInvalido() public {
        vm.startPrank(veterinario);

        vm.expectRevert("ChipID invalido");
        registro.mint(dueno1, 0, Especie.CANINA, block.timestamp, Sexo.MACHO);

        vm.stopPrank();
    }

    function test_RevertMintDestinatarioInvalido() public {
        vm.startPrank(veterinario);

        vm.expectRevert("Direccion destino invalida");
        registro.mint(address(0), CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        vm.stopPrank();
    }

    function test_RevertMintVeterinarioNoHabilitado() public {
        vm.startPrank(noAutorizado);

        vm.expectRevert("No autorizado: veterinario no habilitado");
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        vm.stopPrank();
    }

    function test_RevertMintChipYaRegistrado() public {
        vm.startPrank(veterinario);

        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        vm.expectRevert("Chip ya registrado");
        registro.mint(dueno2, CHIP_1, Especie.FELINA, block.timestamp, Sexo.HEMBRA);

        vm.stopPrank();
    }

    function test_RevertMintDestinatarioNoHabilitado() public {
        vm.startPrank(veterinario);

        vm.expectRevert("Destinatario no habilitado");
        registro.mint(noAutorizado, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        vm.stopPrank();
    }

    // ========================================
    // Tests de Transferencias
    // ========================================

    function test_TransferenciaExitosa() public {
        // Mint inicial
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        // Configurar estado médico válido
        registroMedico.setEstadoAnimal(CHIP_1, true, false, true);

        // Transferir
        vm.prank(dueno1);
        registro.transferFrom(dueno1, dueno2, CHIP_1);

        assertEq(registro.ownerOf(CHIP_1), dueno2);
    }

    function test_RevertTransferenciaOwnerNoHabilitado() public {
        // Mint inicial
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        // Configurar estado médico válido
        registroMedico.setEstadoAnimal(CHIP_1, true, false, true);

        // Deshabilitar dueño
        vm.prank(owner);
        registro.setOwnerEnabled(dueno1, false);

        // Intentar transferir
        vm.prank(dueno1);
        vm.expectRevert("Owner no habilitado");
        registro.transferFrom(dueno1, dueno2, CHIP_1);
    }

    function test_RevertTransferenciaAnimalMuerto() public {
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        // Animal muerto
        registroMedico.setEstadoAnimal(CHIP_1, false, false, true);

        vm.prank(dueno1);
        vm.expectRevert("Animal muerto");
        registro.transferFrom(dueno1, dueno2, CHIP_1);
    }

    function test_RevertTransferenciaAnimalEnfermo() public {
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        // Animal enfermo
        registroMedico.setEstadoAnimal(CHIP_1, true, true, true);

        vm.prank(dueno1);
        vm.expectRevert("Animal enfermo");
        registro.transferFrom(dueno1, dueno2, CHIP_1);
    }

    function test_RevertTransferenciaAnimalNoVacunado() public {
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        // Animal sin vacunas
        registroMedico.setEstadoAnimal(CHIP_1, true, false, false);

        vm.prank(dueno1);
        vm.expectRevert("Animal no vacunado");
        registro.transferFrom(dueno1, dueno2, CHIP_1);
    }

    // ========================================
    // Tests de funciones Owner
    // ========================================

    function test_SetOwnerEnabled() public {
        vm.startPrank(owner);

        address nuevoDueno = address(100);
        assertEq(registro.ownerEnabled(nuevoDueno), false);

        registro.setOwnerEnabled(nuevoDueno, true);
        assertEq(registro.ownerEnabled(nuevoDueno), true);

        registro.setOwnerEnabled(nuevoDueno, false);
        assertEq(registro.ownerEnabled(nuevoDueno), false);

        vm.stopPrank();
    }

    function test_RevertSetOwnerEnabledNoOwner() public {
        vm.prank(noAutorizado);
        vm.expectRevert();
        registro.setOwnerEnabled(dueno1, false);
    }

    function test_SetBaseURI() public {
        vm.prank(owner);
        registro.setBaseURI("https://nueva-uri.com/");

        // Verificar minteo y tokenURI
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        string memory uri = registro.tokenURI(CHIP_1);
        assertEq(uri, string(abi.encodePacked("https://nueva-uri.com/", vm.toString(CHIP_1))));
    }

    function test_SetRegistroMedicos() public {
        MockRegistroMedico nuevoRegistro = new MockRegistroMedico();

        vm.prank(owner);
        registro.setRegistroMedicos(address(nuevoRegistro));

        assertEq(address(registro.registroMedico()), address(nuevoRegistro));
    }

    function test_SetColegioDeVeterinarios() public {
        MockColegioDeVeterinarios nuevoColegio = new MockColegioDeVeterinarios();

        vm.prank(owner);
        registro.setColegioDeVeterinarios(address(nuevoColegio));

        assertEq(address(registro.colegioDeVeterinarios()), address(nuevoColegio));
    }

    // ========================================
    // Tests de metadata
    // ========================================

    function test_TokenURI() public {
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        string memory uri = registro.tokenURI(CHIP_1);
        assertEq(uri, string(abi.encodePacked("https://api.example.com/metadata/", vm.toString(CHIP_1))));
    }

    function test_AnimalMetadata() public {
        uint256 nacimiento = block.timestamp;

        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.FELINA, nacimiento, Sexo.HEMBRA);

        (Especie especie, uint256 nac, Sexo sexo) = registro.animals(CHIP_1);

        assertEq(uint256(especie), uint256(Especie.FELINA));
        assertEq(nac, nacimiento);
        assertEq(uint256(sexo), uint256(Sexo.HEMBRA));
    }

    // ========================================
    // Tests de edge cases
    // ========================================

    function test_MultipleMints() public {
        vm.startPrank(veterinario);

        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);
        registro.mint(dueno2, CHIP_2, Especie.FELINA, block.timestamp, Sexo.HEMBRA);

        assertEq(registro.ownerOf(CHIP_1), dueno1);
        assertEq(registro.ownerOf(CHIP_2), dueno2);

        vm.stopPrank();
    }

    function test_TransferenciaConApproval() public {
        vm.prank(veterinario);
        registro.mint(dueno1, CHIP_1, Especie.CANINA, block.timestamp, Sexo.MACHO);

        registroMedico.setEstadoAnimal(CHIP_1, true, false, true);

        // Aprobar a dueno2 para transferir
        vm.prank(dueno1);
        registro.approve(dueno2, CHIP_1);

        // dueno2 transfiere a sí mismo
        vm.prank(dueno2);
        registro.transferFrom(dueno1, dueno2, CHIP_1);

        assertEq(registro.ownerOf(CHIP_1), dueno2);
    }
}
