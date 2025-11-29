// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RegistroIdentidadAnimal} from "../src/RegistroIdentidadAnimal.sol";
import {HistoriaClinicaAnimal} from "../src/HistoriaClinicaAnimal.sol";
import {MockColegioDeVeterinarios} from "../src/MockColegioDeVeterinarios.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // MockColegioDeVeterinarios colegio = new MockColegioDeVeterinarios();
        // address colegioAddr = address(colegio);
        // console.log("MockColegioDeVeterinarios:", colegioAddr);
        //
        HistoriaClinicaAnimal historial = new HistoriaClinicaAnimal(0xD9E0Bb2Cd4f52d1393A6165bAb9122C4F0B5DA30);
        address historialAddr = address(historial);
        console.log("HistoriaClinicaAnimal:", historialAddr);

        RegistroIdentidadAnimal identidad =
            new RegistroIdentidadAnimal(0xD9E0Bb2Cd4f52d1393A6165bAb9122C4F0B5DA30, historialAddr);
        address identidadAddr = address(identidad);
        console.log("RegistroIdentidadAnimal:", identidadAddr);

        historial.setRegistroIdentidadAnimal(identidadAddr);

        vm.stopBroadcast();

        // string memory jsonOutput = vm.serializeString("DEPLOY", "network", "sepolia");
        // jsonOutput = vm.serializeAddress(jsonOutput, "colegio", colegioAddr);
        // jsonOutput = vm.serializeAddress(jsonOutput, "historial", historialAddr);
        // jsonOutput = vm.serializeAddress(jsonOutput, "identidad", identidadAddr);
        //
        // vm.writeJson(jsonOutput, "./broadcast/deployments.json");
        //
        // console.log("Deployments guardados en ./broadcast/deployments.json");
    }
}

