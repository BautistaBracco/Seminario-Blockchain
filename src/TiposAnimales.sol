pragma solidity ^0.8.20;

enum Sexo {
    MACHO,
    HEMBRA
}

enum Especie {
    OTRA, // 0: Para especies raras o no contempladas (siempre debe ser la primera)

    // 🐾 Compañía y Domésticos (Pets)
    CANINA, // 1: Perros
    FELINA, // 2: Gatos

    // 🐄 Ganadería Mayor y Carga (Livestock)
    BOVINA, // 3: Vacas, toros (Ganado)
    EQUINA, // 4: Caballos, burros, mulas
    PORCINA, // 5: Cerdos

    // 🐑 Ganadería Menor (Small Ruminants)
    OVINA, // 6: Ovejas
    CAPRINA, // 7: Cabras

    // 🐓 Aves, Acuicultura y Apicultura
    AVICOLA, // 8: Aves de corral (gallinas, patos, pavos)
    PISCICOLA, // 9: Peces de criadero, acuicultura
    APICOLA, // 10: Abejas (Control de colmenas/reinas)

    // 🐇 Otras Especies de Granja
    CUNICOLA, // 11: Conejos

    // 🐍 Especies Exóticas y Fauna
    EXOTICA_MASCOTA, // 12: Reptiles (iguanas, tortugas), hurones, etc.
    FAUNA_SILVESTRE // 13: Animales con permisos de conservación, zoológicos o centros de rescate
}

struct Animal {
    Especie especie;
    uint256 nacimiento;
    // string raza;
    Sexo sexo;
    // string propositoProductivo;
}
