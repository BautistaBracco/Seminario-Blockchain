// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CoreAnimal} from "./CoreAnimal.sol";
import {IColegioDeVeterinarios, IRegistroIdentidadAnimal} from "./Interfaces.sol";
import {EstadoSalud, Especie} from "./TiposAnimales.sol";

/**
 * @title RegistroVacunacionAnimal
 * @notice Gestiona historiales de vacunas de animales registrados
 * @dev Implementa controles de acceso y validaciones para garantizar integridad de datos
 */
contract RegistroVacunacionAnimal is CoreAnimal {
    struct VacunaAplicada {
        string tipo;
        uint256 fechaAdministracion;
        uint16 edadMeses;
        address veterinario;
        uint8 numeroDosisSerie; // Número de dosis en la serie (1ra, 2da, 3ra, etc.)
        bool esRefuerzo; // Indica si es refuerzo periódico
    }

    struct CalendarioVacuna {
        uint16 edadMinMeses;
        uint16 edadMaxMeses; // 0 = sin límite superior
        bool unica; // Solo se aplica una vez en la vida
        uint256 duracionValidez; // En segundos (para refuerzos periódicos)
        bool requiereRefuerzo;
        uint8 dosisIniciales;
        uint256 separacionInicialMin; // Tiempo mínimo entre dosis iniciales
        uint256 tiempoMaximoRetraso; // Tolerancia para considerar válido el refuerzo
        bool activo; // Para desactivar vacunas sin eliminarlas
    }

    struct EstadoVacunacion {
        uint8 dosisCompletadas;
        uint256 ultimaFechaAplicacion;
        bool serieInicialCompleta;
        bool requiereRefuerzo;
        uint256 proximoRefuerzo;
    }

    // ============ Variables de Estado ============

    // Gestión de vacunas
    mapping(uint256 => VacunaAplicada[]) private vacunasAplicadas;
    mapping(string => CalendarioVacuna) public calendariosVacunas;
    mapping(string => bool) public tiposVacunasRegistradas;
    mapping(Especie => string[]) public vacunasRequeridasPorEspecie;

    // Estado de vacunación por animal y tipo
    mapping(uint256 => mapping(string => EstadoVacunacion)) public estadoVacunacionAnimal;

    // ============ Eventos ============

    event VacunaRegistrada(string indexed tipo, uint16 edadMinMeses, uint16 edadMaxMeses, Especie[] especiesRequeridas);

    event VacunaAplicadaEvent(
        uint256 indexed chipId,
        string indexed tipo,
        uint256 fecha,
        address indexed veterinario,
        uint8 numeroDosisSerie,
        bool esRefuerzo
    );

    event EstadoVacunacionActualizado(
        uint256 indexed chipId, string indexed tipo, bool serieCompleta, uint256 proximoRefuerzo
    );

    event CalendarioVacunaActualizado(string indexed tipo);
    event CalendarioVacunaDesactivado(string indexed tipo);

    // ============ Errores Personalizados ============

    error VacunaNoRegistrada(string tipo);
    error VacunaYaRegistrada(string tipo);
    error VacunaInactiva(string tipo);
    error EdadFueraDeRango(uint16 edadActual, uint16 edadMin, uint16 edadMax);
    error DosisDemasiadoPronto(uint256 tiempoTranscurrido, uint256 separacionMinima);
    error SerieInicialIncompleta(uint8 dosisActuales, uint8 dosisRequeridas);
    error VacunaUnicaYaAplicada(string tipo);
    error DescripcionVacia();
    error ParametrosInvalidos();

    // ============ Modificadores ============

    modifier vacunaRegistradaYActiva(string memory tipo) {
        if (!tiposVacunasRegistradas[tipo]) {
            revert VacunaNoRegistrada(tipo);
        }
        if (!calendariosVacunas[tipo].activo) {
            revert VacunaInactiva(tipo);
        }
        _;
    }

    // ============ Constructor ============

    constructor(address colegioDeVeterinariosAddr, address registroIdentidadAnimalAddr)
        CoreAnimal(colegioDeVeterinariosAddr, registroIdentidadAnimalAddr)
    {}

    // ============ Gestión de Calendarios de Vacunas ============

    /**
     * @notice Registra un nuevo calendario de vacunación
     * @dev Solo puede ser llamado por el propietario del contrato
     */
    function registrarCalendarioVacuna(
        string calldata tipo,
        uint16 edadMinMeses,
        uint16 edadMaxMeses,
        bool unica,
        uint256 duracionValidez,
        bool requiereRefuerzo,
        uint8 dosisIniciales,
        uint256 separacionInicialMin,
        uint256 tiempoMaximoRetraso,
        Especie[] calldata especiesRequeridas
    ) external onlyOwner {
        if (bytes(tipo).length == 0 || especiesRequeridas.length == 0) {
            revert ParametrosInvalidos();
        }
        if (tiposVacunasRegistradas[tipo]) {
            revert VacunaYaRegistrada(tipo);
        }
        if (edadMaxMeses > 0 && edadMinMeses > edadMaxMeses) {
            revert ParametrosInvalidos();
        }
        if (requiereRefuerzo && dosisIniciales == 0) {
            revert ParametrosInvalidos();
        }

        CalendarioVacuna memory nuevoCalendario = CalendarioVacuna({
            edadMinMeses: edadMinMeses,
            edadMaxMeses: edadMaxMeses,
            unica: unica,
            duracionValidez: duracionValidez,
            requiereRefuerzo: requiereRefuerzo,
            dosisIniciales: dosisIniciales,
            separacionInicialMin: separacionInicialMin,
            tiempoMaximoRetraso: tiempoMaximoRetraso,
            activo: true
        });

        calendariosVacunas[tipo] = nuevoCalendario;
        tiposVacunasRegistradas[tipo] = true;

        for (uint256 i = 0; i < especiesRequeridas.length; i++) {
            vacunasRequeridasPorEspecie[especiesRequeridas[i]].push(tipo);
        }

        emit VacunaRegistrada(tipo, edadMinMeses, edadMaxMeses, especiesRequeridas);
    }

    /**
     * @notice Actualiza un calendario de vacuna existente
     */
    function actualizarCalendarioVacuna(
        string calldata tipo,
        uint16 edadMinMeses,
        uint16 edadMaxMeses,
        uint256 duracionValidez,
        uint256 separacionInicialMin,
        uint256 tiempoMaximoRetraso
    ) external onlyOwner vacunaRegistradaYActiva(tipo) {
        CalendarioVacuna storage calendario = calendariosVacunas[tipo];

        calendario.edadMinMeses = edadMinMeses;
        calendario.edadMaxMeses = edadMaxMeses;
        calendario.duracionValidez = duracionValidez;
        calendario.separacionInicialMin = separacionInicialMin;
        calendario.tiempoMaximoRetraso = tiempoMaximoRetraso;

        emit CalendarioVacunaActualizado(tipo);
    }

    /**
     * @notice Desactiva un calendario de vacuna (no lo elimina)
     */
    function desactivarCalendarioVacuna(string calldata tipo) external onlyOwner vacunaRegistradaYActiva(tipo) {
        calendariosVacunas[tipo].activo = false;
        emit CalendarioVacunaDesactivado(tipo);
    }

    // ============ Aplicación y Consulta de Vacunas ============

    /**
     * @notice Registra la aplicación de una vacuna a un animal
     * @param chipId Identificador del animal
     * @param tipo Tipo de vacuna
     * @param edadMeses Edad del animal en meses al momento de aplicación
     */
    function registrarVacunaAplicada(uint256 chipId, string calldata tipo, uint16 edadMeses)
        external
        soloVeterinarioAutorizado
        animalRegistrado(chipId)
        vacunaRegistradaYActiva(tipo)
    {
        CalendarioVacuna memory calendario = calendariosVacunas[tipo];
        EstadoVacunacion storage estado = estadoVacunacionAnimal[chipId][tipo];

        // Validar edad
        if (edadMeses < calendario.edadMinMeses) {
            revert EdadFueraDeRango(edadMeses, calendario.edadMinMeses, calendario.edadMaxMeses);
        }
        if (calendario.edadMaxMeses > 0 && edadMeses > calendario.edadMaxMeses) {
            revert EdadFueraDeRango(edadMeses, calendario.edadMinMeses, calendario.edadMaxMeses);
        }

        // Validar si es vacuna única
        if (calendario.unica && estado.dosisCompletadas > 0) {
            revert VacunaUnicaYaAplicada(tipo);
        }

        // Determinar si es dosis inicial o refuerzo
        bool esRefuerzo = estado.serieInicialCompleta;
        uint8 numeroDosisSerie = estado.dosisCompletadas + 1;

        // Si no es refuerzo, validar serie inicial
        if (!esRefuerzo && calendario.requiereRefuerzo) {
            // Validar separación mínima entre dosis iniciales
            if (estado.dosisCompletadas > 0) {
                uint256 tiempoTranscurrido = block.timestamp - estado.ultimaFechaAplicacion;
                if (tiempoTranscurrido < calendario.separacionInicialMin) {
                    revert DosisDemasiadoPronto(tiempoTranscurrido, calendario.separacionInicialMin);
                }
            }
        }

        // Registrar vacuna aplicada
        VacunaAplicada memory nuevaVacuna = VacunaAplicada({
            tipo: tipo,
            fechaAdministracion: block.timestamp,
            edadMeses: edadMeses,
            veterinario: msg.sender,
            numeroDosisSerie: numeroDosisSerie,
            esRefuerzo: esRefuerzo
        });

        vacunasAplicadas[chipId].push(nuevaVacuna);

        // Actualizar estado de vacunación
        estado.dosisCompletadas++;
        estado.ultimaFechaAplicacion = block.timestamp;

        // Verificar si completó serie inicial
        if (!estado.serieInicialCompleta && calendario.requiereRefuerzo) {
            if (estado.dosisCompletadas >= calendario.dosisIniciales) {
                estado.serieInicialCompleta = true;
            }
        } else if (!calendario.requiereRefuerzo) {
            estado.serieInicialCompleta = true;
        }

        // Calcular próximo refuerzo
        if (estado.serieInicialCompleta && calendario.duracionValidez > 0) {
            estado.proximoRefuerzo = block.timestamp + calendario.duracionValidez;
            estado.requiereRefuerzo = true;
        }

        emit VacunaAplicadaEvent(chipId, tipo, block.timestamp, msg.sender, numeroDosisSerie, esRefuerzo);
        emit EstadoVacunacionActualizado(chipId, tipo, estado.serieInicialCompleta, estado.proximoRefuerzo);
    }

    /**
     * @notice Obtiene todas las vacunas aplicadas a un animal
     */
    function obtenerVacunasAplicadas(uint256 chipId)
        external
        view
        animalRegistrado(chipId)
        returns (VacunaAplicada[] memory)
    {
        return vacunasAplicadas[chipId];
    }

    /**
     * @notice Obtiene el estado de vacunación de un animal para un tipo específico
     */
    function obtenerEstadoVacunacion(uint256 chipId, string calldata tipo)
        external
        view
        animalRegistrado(chipId)
        returns (EstadoVacunacion memory)
    {
        return estadoVacunacionAnimal[chipId][tipo];
    }

    /**
     * @notice Verifica si un animal tiene su vacunación completa y actualizada
     */
    function vacunacionCompleta(uint256 chipId, string calldata tipo)
        external
        view
        animalRegistrado(chipId)
        returns (bool completa, bool requiereRefuerzo, uint256 proximaFecha)
    {
        EstadoVacunacion memory estado = estadoVacunacionAnimal[chipId][tipo];
        CalendarioVacuna memory calendario = calendariosVacunas[tipo];

        completa = estado.serieInicialCompleta;

        if (completa && calendario.duracionValidez > 0) {
            // Verificar si está dentro del periodo de validez
            if (block.timestamp > estado.proximoRefuerzo + calendario.tiempoMaximoRetraso) {
                completa = false;
                requiereRefuerzo = true;
            }
        }

        proximaFecha = estado.proximoRefuerzo;
    }

    // @notice Obtiene si el animal tiene todas las vacunas del calendario requeridas
    function tieneTodasLasVacunas(uint256 chipId, Especie especie)
        external
        view
        animalRegistrado(chipId)
        returns (bool)
    {
        string[] memory vacunasRequeridas = vacunasRequeridasPorEspecie[especie];

        for (uint256 i = 0; i < vacunasRequeridas.length; i++) {
            (bool completa,,) = this.vacunacionCompleta(chipId, vacunasRequeridas[i]);
            if (!completa) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Obtiene todas las vacunas requeridas para una especie
     */
    function obtenerVacunasRequeridas(Especie especie) external view returns (string[] memory) {
        return vacunasRequeridasPorEspecie[especie];
    }

    /**
     * @notice Obtiene información del calendario de una vacuna
     */
    function obtenerCalendarioVacuna(string calldata tipo) external view returns (CalendarioVacuna memory) {
        return calendariosVacunas[tipo];
    }
}

