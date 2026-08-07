namespace bloques {
    /**
     * Potenciómetro en un puerto GPIO (lectura analógica 0-1023).
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=potenciometro
    //% block="Potenciómetro │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=97 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
