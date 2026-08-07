namespace bloques {
    /**
     * Botón conectado a un puerto GPIO (pull-up, activo en alto
     * lógico: presionado=1, suelto=0).
     */
    //% blockId=boton
    //% block="Botón │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=100 blockGap=8
    export function boton(puerto: SabanaPuerto): number {
        const pin = puertoToDigitalPin(puerto)
        pins.setPull(pin, PinPullMode.PullUp)
        return 1 - pins.digitalReadPin(pin)
    }
}
