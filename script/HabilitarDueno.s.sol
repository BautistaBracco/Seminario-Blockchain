// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import {RegistroIdentidadAnimal} from "../src/RegistroIdentidadAnimal.sol";

contract HabilitarDueno is Script {
    function run() external {
        // Dirección del contrato RegistroIdentidadAnimal desplegado
        address RIA = 0x23f370c198d96E637e6Bac66c2dE898785D837eC; 

        // Dueño a habilitar
        address DUENO = 0x6Cae87d29EF5D0AA09344f2C310FC5269a9BF088; 

        // Cargar private key desde el .env
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        RegistroIdentidadAnimal registro = RegistroIdentidadAnimal(RIA);

        registro.setOwnerEnabled(DUENO, true);

        vm.stopBroadcast();

        console.log("Dueno habilitado:", DUENO);
    }
}

