namespace bloques {
    /**
     * Sensor de luz (fotorresistencia) en un puerto GPIO.
     * Lectura analógica 0-1023.
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=luz
    //% block="Sensor de Luz │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=96 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
