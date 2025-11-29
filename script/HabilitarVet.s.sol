// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import {MockColegioDeVeterinarios} from "../src/MockColegioDeVeterinarios.sol";

contract HabilitarVet is Script {
    function run() external {
        address COLEGIO_ADDR = 0xD9E0Bb2Cd4f52d1393A6165bAb9122C4F0B5DA30;
        address VETERINARIO = 0x7085f13112156cEa21DE14eF8aea4c0C1aD84530;

        // Leer private key del .env
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        MockColegioDeVeterinarios colegio = MockColegioDeVeterinarios(COLEGIO_ADDR);

        colegio.habilitarVeterinario(VETERINARIO);

        vm.stopBroadcast();

        console.log("Veterinario habilitado con exito");
    }
}

