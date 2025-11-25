// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RegistroIdentidadAnimal} from "../src/RegistroIdentidadAnimal.sol";
import {HistoriaClinicaAnimal} from "../src/HistoriaClinicaAnimal.sol";
import {RegistroVacunacionAnimal} from "../src/RegistroVacunacionAnimal.sol";
// ESTO NO LO TENGO TODAVÍA
import {ColegioDeVeterinarios} from "../src/ColegioDeVeterinarios.sol";
import {IRegistroDeVacunacionAnimal, IHistoriaClinicaAnimal} from "../src/Interfaces.sol";

// NOTA: Asegúrate de que las rutas de importación (ej: "../src/...") sean correctas para tu estructura de proyecto.

contract DeployRegistryScript is Script {
    
    // ===============================================
    // PARÁMETROS DE DESPLIEGUE
    // ===============================================
    
    // Direcciones y valores constantes
    address constant OWNER = 0x...; // ⬅️ Reemplaza con la dirección real del Owner/Deployer
    string constant BASE_URI = "https://metadata.mi-registro.com/animal/";
    
    // Direcciónes temporales o "Placeholder" (0x0)
    address constant ZERO_ADDRESS = address(0);

    function run() public {
        // La transacción comienza aquí
        vm.startBroadcast(vm.envUint("PRIVATE_KEY")); // Usa tu clave privada cargada en la variable de entorno

        // --- 1. Despliegue de la dependencia base ---
        
        console.log("1. Desplegando ColegioDeVeterinarios...");
        // Asumimos que ColegioDeVeterinarios solo requiere el owner en su constructor
        ColegioDeVeterinarios colegio = new ColegioDeVeterinarios(OWNER);
        address addr_colegio = address(colegio);
        console.log("   ColegioDeVeterinarios desplegado en:", addr_colegio);

        // --- 2. Despliegue del contrato Core (RegistroIdentidadAnimal) ---
        
        console.log("2. Desplegando RegistroIdentidadAnimal (con placeholders)...");
        
        // Se despliega primero pasando 0x0 para las direcciones de Historia y Vacunacion,
        // ya que aún no existen. RegistroIdentidadAnimal usa address(this) para su propia dependencia.
        RegistroIdentidadAnimal identidad = new RegistroIdentidadAnimal(
            BASE_URI,
            addr_colegio,
            ZERO_ADDRESS, // Placeholder para HistoriaClinica
            ZERO_ADDRESS  // Placeholder para RegistroVacunacion
        );
        address addr_identidad = address(identidad);
        console.log("   RegistroIdentidadAnimal desplegado en:", addr_identidad);

        // --- 3. Despliegue de los contratos Funcionales ---
        
        console.log("3. Desplegando HistoriaClinicaAnimal...");
        // Estos contratos reciben la dirección de Identidad ahora que ya existe.
        HistoriaClinicaAnimal historia = new HistoriaClinicaAnimal(
            addr_colegio,
            addr_identidad // Dependencia de RegistroIdentidadAnimal
        );
        address addr_historia = address(historia);
        console.log("   HistoriaClinicaAnimal desplegado en:", addr_historia);
        
        console.log("4. Desplegando RegistroVacunacionAnimal...");
        RegistroVacunacionAnimal vacunacion = new RegistroVacunacionAnimal(
            addr_colegio,
            addr_identidad // Dependencia de RegistroIdentidadAnimal
        );
        address addr_vacunacion = address(vacunacion);
        console.log("   RegistroVacunacionAnimal desplegado en:", addr_vacunacion);


        // --- 4. CIERRE DEL CICLO: Configuración Post-Despliegue ---
        
        console.log("5. Conectando las dependencias en RegistroIdentidadAnimal...");
        
        // Llamar a los setters en RegistroIdentidadAnimal (Identidad)
        // para que ahora conozca las direcciones reales de Historia y Vacunacion.
        
        // 5a. Conectar Historia Clínica
        identidad.setRegistroMedico(addr_historia);
        console.log("   Identidad conectado a HistoriaClinica:", addr_historia);
        
        // 5b. Conectar Vacunación
        identidad.setRegistroDeVacunacion(addr_vacunacion);
        console.log("   Identidad conectado a RegistroVacunacion:", addr_vacunacion);
        

        vm.stopBroadcast();
        console.log("✅ Despliegue y configuración completados.");
    }
}
