// STEAMbit 6 — extensión MakeCode para micro:bit.
// Archivo único con todos los bloques de la extensión.
// Código generado desde STV2-PADRE 3.9.0 (fuente de verdad): para cambiar un bloque,
// corregirlo en PADRE y regenerar. Textos en inglés en el código; español y portugués en _locales/.

// Puertos GPIO STV2 — mapeo interno a pines de la micro:bit.
//
// ATENCIÓN: el PUERTO 3 de la placa corresponde al pin P8 de la micro:bit,
// NO al pin P3. Verificado en ORIGINAL/main.ts (p3 = AnalogPin.P8) y en
// EXT4/blocks/smartteam4/puertos.ts (Ext4Puerto.P4 -> DigitalPin.P8).
//
//   PUERTO 0  ->  micro:bit P0
//   PUERTO 1  ->  micro:bit P1
//   PUERTO 2  ->  micro:bit P2
//   PUERTO 3  ->  micro:bit P8   <-- excepción

enum SabanaPuerto {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P3"
    P3 = 3,
}

/**
 * STEAMbit blocks: sensors, outputs, motors and screens.
 */
//% color="#424242" icon="\uf1b3" block="STEAMbit 6" weight=200 groups=['SENSORS', 'OUTPUTS', 'MOVEMENT', 'MOTORS', 'SCREENS']
namespace bloques {

    // ===================== puertos =====================
    // Convierte un puerto de la placa al DigitalPin correspondiente.
    // Usar para lectura/escritura digital (botón, LED, hélice).
    /**
     * Converts a port to its digital pin.
     */
    export function puertoToDigitalPin(puerto: SabanaPuerto): DigitalPin {
        switch (puerto) {
            case SabanaPuerto.P0: return DigitalPin.P0
            case SabanaPuerto.P1: return DigitalPin.P1
            case SabanaPuerto.P2: return DigitalPin.P2
            case SabanaPuerto.P3: return DigitalPin.P8
        }
        return DigitalPin.P0
    }

    // Convierte un puerto de la placa al AnalogPin correspondiente.
    // Usar para lectura analógica (potenciómetro, luz, suelo) y para servo.
    /**
     * Converts a port to its analog pin.
     */
    export function puertoToAnalogPin(puerto: SabanaPuerto): AnalogPin {
        switch (puerto) {
            case SabanaPuerto.P0: return AnalogPin.P0
            case SabanaPuerto.P1: return AnalogPin.P1
            case SabanaPuerto.P2: return AnalogPin.P2
            case SabanaPuerto.P3: return AnalogPin.P8
        }
        return AnalogPin.P0
    }

    // ===================== ultrasonido =====================
    const ULTRASONIDO_I2C_ADDR = 0x23

    // STV2-1 — Ultrasonido conectado por I2C (dirección 0x23). Devuelve la
    // distancia en centímetros, rango 0 a 200.
    //
    // IMPORTANTE: el tercer argumento `true` de i2cWriteBuffer es un
    // repeated-start (sin condición de stop). Es obligatorio para que la
    // lectura siguiente devuelva el registro pedido. NO quitarlo.
    /**
     * Measures the distance to an object in centimeters (0 to 200).
     */
    //% blockId=ultrasonido
    //% block="Ultrasonic │ on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=95 blockGap=8
    export function ultrasonido(): number {
        basic.pause(20)

        let buf = pins.createBuffer(1)
        buf[0] = 0x0A
        pins.i2cWriteBuffer(ULTRASONIDO_I2C_ADDR, buf, true)

        let r = pins.i2cReadBuffer(ULTRASONIDO_I2C_ADDR, 2)
        let mm = (r[0] << 8) | r[1]
        let cm = Math.round(mm / 10)
        if (cm < 0) cm = 0
        if (cm > 200) cm = 200
        return cm
    }

    // ===================== boton =====================
    // STV2-2 — Botón conectado a un puerto GPIO (pull-up, activo en alto
    // lógico: presionado=1, suelto=0).
    /**
     * Returns 1 if the button is pressed and 0 if it is not.
     */
    //% blockId=boton
    //% block="Button │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=100 blockGap=8
    export function boton(puerto: SabanaPuerto): number {
        const pin = puertoToDigitalPin(puerto)
        pins.setPull(pin, PinPullMode.PullUp)
        return 1 - pins.digitalReadPin(pin)
    }

    // ===================== dht11 =====================
    export enum SabanaDatoDHT11 {
        //% block="Humidity"
        Humedad = 0,
        //% block="Temperature"
        Temperatura = 1,
    }

    const DHT11_I2C_ADDR = 0x27

    // STV2-3 — DHT11 (humedad/temperatura) por I2C (dirección 0x27).
    // Rangos del sensor: Humedad 20% a 90% RH · Temperatura 0°C a 50°C
    // (enteros, sin decimales).
    /**
     * Measures temperature (°C) or humidity (%).
     */
    //% blockId=dht11
    //% block="%dato │ on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=93 blockGap=8
    export function dht11(dato: SabanaDatoDHT11): number {
        let trigger = pins.createBuffer(1)
        trigger[0] = 0xAC
        pins.i2cWriteBuffer(DHT11_I2C_ADDR, trigger)
        let buf = pins.i2cReadBuffer(DHT11_I2C_ADDR, 5)
        if (dato == SabanaDatoDHT11.Humedad) {
            return buf[2]
        }
        return buf[0]
    }

    // ===================== suelo =====================
    // STV2-5 — Sensor de suelo (línea) en un puerto GPIO.
    /**
     * Measures soil moisture (0 to 1023).
     */
    //% blockId=suelo
    //% block="Soil Sensor │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=98 blockGap=8
    export function suelo(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }

    // ===================== potenciometro =====================
    // STV2-6 — Potenciómetro en un puerto GPIO (lectura analógica 0-1023).
    //
    // Origen del código: ORIGINAL/block/sensorGPIO.ts -> Potentiometer()
    //   return pins.analogReadPin(num)
    //
    // NOTA HISTÓRICA: la tabla original tenía el texto "Suelo en el puerto X"
    // (copiado por error de STV2-5). Se corrigió a "Potenciómetro..." para que
    // coincida con el componente. El texto NO se vuelve a tocar.
    //
    // @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
    /**
     * Reads the knob position (0 to 1023).
     */
    //% blockId=potenciometro
    //% block="Potentiometer │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=97 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }

    // ===================== luz =====================
    // STV2-7 — Sensor de luz (fotorresistencia) en un puerto GPIO.
    // Lectura analógica 0-1023, INVERTIDA (2026-10-25, probado en físico en
    // EXT5): el sensor entrega 0 con mucha luz, así que se devuelve
    // 1023 - lectura → 1023 = mucha luz, 0 = oscuridad.
    //
    // Origen del código: ORIGINAL/block/sensorGPIO.ts -> Photosensitive()
    //   return pins.analogReadPin(num)
    //
    // NOTA HISTÓRICA: la tabla original decía "Suelo" por un copiado erróneo de
    // STV2-5. El texto ya fue corregido a "Sensor de Luz" y NO se vuelve a tocar.
    //
    // @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
    /**
     * Measures light: 0 = dark, 1023 = very bright.
     */
    //% blockId=luz
    //% block="Light Sensor │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=96 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return 1023 - pins.analogReadPin(puertoToAnalogPin(puerto))
    }

    // ===================== tira_rgb =====================
    const TIRA_RGB_I2C_ADDR = 0x24
    const TIRA_RGB_BASE = 0x0A

    let tiraRgbColores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    function tiraRgbLimitar(valor: number): number {
        return Math.max(0, Math.min(255, valor))
    }

    function tiraRgbActualizar(): void {
        let buf = pins.createBuffer(19)
        buf[0] = TIRA_RGB_BASE + 0x01
        for (let i = 0; i < 18; i++) {
            buf[i + 1] = tiraRgbColores[i]
        }
        pins.i2cWriteBuffer(TIRA_RGB_I2C_ADDR, buf)
    }

    function tiraRgbSetPixel(index: number, colorEmpacado: number): void {
        const r = tiraRgbLimitar((colorEmpacado >> 16) & 0xFF)
        const g = tiraRgbLimitar((colorEmpacado >> 8) & 0xFF)
        const b = tiraRgbLimitar(colorEmpacado & 0xFF)
        tiraRgbColores[index * 3] = r
        tiraRgbColores[index * 3 + 1] = g
        tiraRgbColores[index * 3 + 2] = b
    }

    // STV2-9 — Tira RGB de 6 LEDs por I2C (dirección 0x24). Cada LED se
    // elige con un selector de color (paleta).
    /**
     * Sets the color of each of the 6 LEDs on the strip.
     */
    //% blockId=tira_rgb
    //% block="RGB Strip │ %led1 %led2 %led3 %led4 %led5 %led6 on I2C pin"
    //% led1.shadow="colorNumberPicker" led2.shadow="colorNumberPicker"
    //% led3.shadow="colorNumberPicker" led4.shadow="colorNumberPicker"
    //% led5.shadow="colorNumberPicker" led6.shadow="colorNumberPicker"
    //% inlineInputMode=inline
    //% group="OUTPUTS" color="#35BFE9" weight=98 blockGap=8
    export function tiraRgb(
        led1: number, led2: number, led3: number,
        led4: number, led5: number, led6: number
    ): void {
        tiraRgbSetPixel(0, led1)
        tiraRgbSetPixel(1, led2)
        tiraRgbSetPixel(2, led3)
        tiraRgbSetPixel(3, led4)
        tiraRgbSetPixel(4, led5)
        tiraRgbSetPixel(5, led6)
        tiraRgbActualizar()
    }

    // STV2-11 — Ajusta la tira RGB con valores independientes de R, G y B (0-255).
    /**
     * Lights the whole strip with a mix of red, green and blue (0 to 255).
     */
    //% blockId=tira_rgb_rgb
    //% block="RGB Strip │ set to R %r G %g B %b"
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=255
    //% group="OUTPUTS" color="#35BFE9" weight=97 blockGap=8
    export function tiraRgbAjustada(r: number, g: number, b: number): void {
        r = tiraRgbLimitar(r)
        g = tiraRgbLimitar(g)
        b = tiraRgbLimitar(b)
        for (let i = 0; i < 6; i++) {
            tiraRgbColores[i * 3] = r
            tiraRgbColores[i * 3 + 1] = g
            tiraRgbColores[i * 3 + 2] = b
        }
        tiraRgbActualizar()
    }

    // NUEVO — Apaga todos los LEDs de la tira RGB.
    /**
     * Turns off all the LEDs on the strip.
     */
    //% blockId=tira_rgb_apagar_todos
    //% block="RGB Strip │ turn off all"
    //% group="OUTPUTS" color="#35BFE9" weight=96 blockGap=8
    export function tiraRgbApagarTodos(): void {
        for (let i = 0; i < 18; i++) {
            tiraRgbColores[i] = 0
        }
        tiraRgbActualizar()
    }

    // ===================== led =====================
    export enum SabanaEstadoOnOff {
        //% block="ON"
        ON = 0,
        //% block="OFF"
        OFF = 1,
    }

    // STV2-10 — LED simple en un puerto GPIO, con estado ON/OFF.
    /**
     * Turns the LED on or off.
     */
    //% blockId=led
    //% block="LED │ State %estado on pin %puerto"
    //% group="OUTPUTS" color="#FFB800" weight=100 blockGap=8
    export function led(estado: SabanaEstadoOnOff, puerto: SabanaPuerto): void {
        const pin = puertoToDigitalPin(puerto)
        pins.digitalWritePin(pin, estado == SabanaEstadoOnOff.ON ? 0 : 1)
    }

    // NUEVO — LED con intensidad variable (PWM) en un puerto GPIO, 0 a 1023.
    /**
     * Sets the LED brightness: 0 = off, 1023 = maximum.
     */
    //% blockId=led_intensidad
    //% block="LED │ Brightness %intensidad on pin %puerto"
    //% intensidad.min=0 intensidad.max=1023 intensidad.defl=0
    //% group="OUTPUTS" color="#FFB800" weight=99 blockGap=8
    export function ledIntensidad(intensidad: number, puerto: SabanaPuerto): void {
        pins.analogWritePin(puertoToAnalogPin(puerto), Math.constrain(intensidad, 0, 1023))
    }

    // ===================== lcd =====================
    export enum SabanaColumna16 {
        //% block="0"
        C0 = 0,
        //% block="1"
        C1 = 1,
        //% block="2"
        C2 = 2,
        //% block="3"
        C3 = 3,
        //% block="4"
        C4 = 4,
        //% block="5"
        C5 = 5,
        //% block="6"
        C6 = 6,
        //% block="7"
        C7 = 7,
        //% block="8"
        C8 = 8,
        //% block="9"
        C9 = 9,
        //% block="10"
        C10 = 10,
        //% block="11"
        C11 = 11,
        //% block="12"
        C12 = 12,
        //% block="13"
        C13 = 13,
        //% block="14"
        C14 = 14,
        //% block="15"
        C15 = 15,
    }

    // ===================== oled =====================
    export enum SabanaOledFila {
        //% block="0"
        F0 = 0,
        //% block="1"
        F1 = 1,
        //% block="2"
        F2 = 2,
        //% block="3"
        F3 = 3,
    }

    // ── Motor real portado de EXT4/blocks/smartteam4/oled.ts ──────────
    // SSD1306 128×64px — fuente 8×16px — 4 filas × 16 columnas

    const OLED_ADDR = 60
        // 0x3C
    const OLED_COLS = 16
        // caracteres por fila
    const CHAR_W = 8
            // píxeles ancho por carácter

    let _oledInitialized = false

    // Fuente 8×16 (ASCII 32–127). Cada carácter = 16 bytes: 8 bytes página
    // superior + 8 bytes página inferior. Fuente estándar SSD1306 8×16.
    const OLED_FONT8x16: number[] = [
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // ' '
        0x00,0x00,0x00,0xF8,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x33,0x30,0x00,0x00,0x00, // '!'
        0x00,0x10,0x0C,0x06,0x10,0x0C,0x06,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // '"'
        0x40,0xC0,0x78,0x40,0xC0,0x78,0x40,0x00,0x04,0x3F,0x04,0x04,0x3F,0x04,0x04,0x00, // '#'
        0x00,0x70,0x88,0xFC,0x08,0x30,0x00,0x00,0x00,0x18,0x20,0xFF,0x21,0x1E,0x00,0x00, // '$'
        0xF0,0x08,0xF0,0x00,0xE0,0x18,0x00,0x00,0x00,0x21,0x1C,0x03,0x1E,0x21,0x1E,0x00, // '%'
        0x00,0xF0,0x08,0x88,0x70,0x00,0x00,0x00,0x1E,0x21,0x23,0x24,0x19,0x27,0x21,0x10, // '&'
        0x10,0x16,0x0E,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // '''
        0x00,0x00,0x00,0xE0,0x18,0x04,0x02,0x00,0x00,0x00,0x00,0x07,0x18,0x20,0x40,0x00, // '('
        0x00,0x02,0x04,0x18,0xE0,0x00,0x00,0x00,0x00,0x40,0x20,0x18,0x07,0x00,0x00,0x00, // ')'
        0x40,0x40,0x80,0xF0,0x80,0x40,0x40,0x00,0x02,0x02,0x01,0x0F,0x01,0x02,0x02,0x00, // '*'
        0x00,0x00,0x00,0xF0,0x00,0x00,0x00,0x00,0x01,0x01,0x01,0x1F,0x01,0x01,0x01,0x00, // '+'
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0xB0,0x70,0x00,0x00,0x00,0x00,0x00, // ','
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x01,0x01,0x01,0x01,0x01,0x00, // '-'
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x30,0x30,0x00,0x00,0x00,0x00,0x00, // '.'
        0x00,0x00,0x00,0x00,0x80,0x60,0x18,0x04,0x60,0x18,0x06,0x01,0x00,0x00,0x00,0x00, // '/'
        0x00,0xE0,0x10,0x08,0x08,0x10,0xE0,0x00,0x00,0x0F,0x10,0x20,0x20,0x10,0x0F,0x00, // '0'
        0x00,0x10,0x10,0xF8,0x00,0x00,0x00,0x00,0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // '1'
        0x00,0x70,0x08,0x08,0x08,0x88,0x70,0x00,0x00,0x30,0x28,0x24,0x22,0x21,0x30,0x00, // '2'
        0x00,0x30,0x08,0x88,0x88,0x48,0x30,0x00,0x00,0x18,0x20,0x20,0x20,0x11,0x0E,0x00, // '3'
        0x00,0x00,0xC0,0x20,0x10,0xF8,0x00,0x00,0x00,0x07,0x04,0x24,0x24,0x3F,0x24,0x00, // '4'
        0x00,0xF8,0x08,0x88,0x88,0x08,0x08,0x00,0x00,0x19,0x21,0x20,0x20,0x11,0x0E,0x00, // '5'
        0x00,0xE0,0x10,0x88,0x88,0x18,0x00,0x00,0x00,0x0F,0x11,0x20,0x20,0x11,0x0E,0x00, // '6'
        0x00,0x38,0x08,0x08,0xC8,0x38,0x08,0x00,0x00,0x00,0x00,0x3F,0x00,0x00,0x00,0x00, // '7'
        0x00,0x70,0x88,0x08,0x08,0x88,0x70,0x00,0x00,0x1C,0x22,0x21,0x21,0x22,0x1C,0x00, // '8'
        0x00,0xE0,0x10,0x08,0x08,0x10,0xE0,0x00,0x00,0x00,0x31,0x22,0x22,0x11,0x0F,0x00, // '9'
        0x00,0x00,0x00,0xC0,0xC0,0x00,0x00,0x00,0x00,0x00,0x00,0x30,0x30,0x00,0x00,0x00, // ':'
        0x00,0x00,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0x60,0x00,0x00,0x00,0x00, // ';'
        0x00,0x00,0x80,0x40,0x20,0x10,0x08,0x00,0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x00, // '<'
        0x40,0x40,0x40,0x40,0x40,0x40,0x40,0x00,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x00, // '='
        0x00,0x08,0x10,0x20,0x40,0x80,0x00,0x00,0x00,0x20,0x10,0x08,0x04,0x02,0x01,0x00, // '>'
        0x00,0x70,0x48,0x08,0x08,0x08,0xF0,0x00,0x00,0x00,0x00,0x30,0x36,0x01,0x00,0x00, // '?'
        0xC0,0x30,0xC8,0x28,0xE8,0x10,0xE0,0x00,0x07,0x18,0x27,0x24,0x23,0x14,0x0B,0x00, // '@'
        0x00,0x00,0xC0,0x38,0xE0,0x00,0x00,0x00,0x20,0x3C,0x23,0x02,0x02,0x27,0x38,0x20, // 'A'
        0x08,0xF8,0x88,0x88,0x88,0x70,0x00,0x00,0x20,0x3F,0x20,0x20,0x20,0x11,0x0E,0x00, // 'B'
        0xC0,0x30,0x08,0x08,0x08,0x08,0x38,0x00,0x07,0x18,0x20,0x20,0x20,0x10,0x08,0x00, // 'C'
        0x08,0xF8,0x08,0x08,0x08,0x10,0xE0,0x00,0x20,0x3F,0x20,0x20,0x20,0x10,0x0F,0x00, // 'D'
        0x08,0xF8,0x88,0x88,0xE8,0x08,0x10,0x00,0x20,0x3F,0x20,0x20,0x23,0x20,0x18,0x00, // 'E'
        0x08,0xF8,0x88,0x88,0xE8,0x08,0x10,0x00,0x20,0x3F,0x20,0x00,0x03,0x00,0x00,0x00, // 'F'
        0xC0,0x30,0x08,0x08,0x08,0x38,0x00,0x00,0x07,0x18,0x20,0x20,0x22,0x1E,0x02,0x00, // 'G'
        0x08,0xF8,0x08,0x00,0x00,0x08,0xF8,0x08,0x20,0x3F,0x21,0x01,0x01,0x21,0x3F,0x20, // 'H'
        0x00,0x08,0x08,0xF8,0x08,0x08,0x00,0x00,0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'I'
        0x00,0x00,0x08,0x08,0xF8,0x08,0x08,0x00,0xC0,0x80,0x80,0x80,0x7F,0x00,0x00,0x00, // 'J'
        0x08,0xF8,0x88,0xC0,0x28,0x18,0x08,0x00,0x20,0x3F,0x20,0x01,0x26,0x38,0x20,0x00, // 'K'
        0x08,0xF8,0x08,0x00,0x00,0x00,0x00,0x00,0x20,0x3F,0x20,0x20,0x20,0x20,0x30,0x00, // 'L'
        0x08,0xF8,0xF8,0x00,0xF8,0xF8,0x08,0x00,0x20,0x3F,0x00,0x3F,0x00,0x3F,0x20,0x00, // 'M'
        0x08,0xF8,0x30,0xC0,0x00,0x08,0xF8,0x08,0x20,0x3F,0x20,0x00,0x07,0x18,0x3F,0x00, // 'N'
        0xE0,0x10,0x08,0x08,0x08,0x10,0xE0,0x00,0x0F,0x10,0x20,0x20,0x20,0x10,0x0F,0x00, // 'O'
        0x08,0xF8,0x08,0x08,0x08,0x08,0xF0,0x00,0x20,0x3F,0x21,0x01,0x01,0x01,0x00,0x00, // 'P'
        0xE0,0x10,0x08,0x08,0x08,0x10,0xE0,0x00,0x0F,0x18,0x24,0x24,0x38,0x50,0x4F,0x00, // 'Q'
        0x08,0xF8,0x88,0x88,0x88,0x88,0x70,0x00,0x20,0x3F,0x20,0x00,0x03,0x0C,0x30,0x20, // 'R'
        0x00,0x70,0x88,0x08,0x08,0x08,0x38,0x00,0x00,0x38,0x20,0x21,0x21,0x22,0x1C,0x00, // 'S'
        0x18,0x08,0x08,0xF8,0x08,0x08,0x18,0x00,0x00,0x00,0x20,0x3F,0x20,0x00,0x00,0x00, // 'T'
        0x08,0xF8,0x08,0x00,0x00,0x08,0xF8,0x08,0x00,0x1F,0x20,0x20,0x20,0x20,0x1F,0x00, // 'U'
        0x08,0x78,0x88,0x00,0x00,0xC8,0x38,0x08,0x00,0x00,0x07,0x38,0x0E,0x01,0x00,0x00, // 'V'
        0xF8,0x08,0x00,0xF8,0x00,0x08,0xF8,0x00,0x03,0x3C,0x07,0x00,0x07,0x3C,0x03,0x00, // 'W'
        0x08,0x18,0x68,0x80,0x80,0x68,0x18,0x08,0x20,0x30,0x2C,0x03,0x03,0x2C,0x30,0x20, // 'X'
        0x08,0x38,0xC8,0x00,0xC8,0x38,0x08,0x00,0x00,0x00,0x20,0x3F,0x20,0x00,0x00,0x00, // 'Y'
        0x10,0x08,0x08,0x08,0xC8,0x38,0x08,0x00,0x20,0x38,0x26,0x21,0x20,0x20,0x18,0x00, // 'Z'
        0x00,0x00,0x00,0xFE,0x02,0x02,0x02,0x00,0x00,0x00,0x00,0x7F,0x40,0x40,0x40,0x00, // '['
        0x00,0x0C,0x30,0xC0,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x06,0x38,0xC0,0x00, // '\'
        0x00,0x02,0x02,0x02,0xFE,0x00,0x00,0x00,0x00,0x40,0x40,0x40,0x7F,0x00,0x00,0x00, // ']'
        0x00,0x00,0x04,0x02,0x02,0x02,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // '^'
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0x80,0x80,0x80,0x80,0x80,0x80,0x80, // '_'
        0x00,0x02,0x02,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // '`'
        0x00,0x00,0x80,0x80,0x80,0x80,0x00,0x00,0x00,0x19,0x24,0x22,0x22,0x22,0x3F,0x20, // 'a'
        0x08,0xF8,0x00,0x80,0x80,0x00,0x00,0x00,0x00,0x3F,0x11,0x20,0x20,0x11,0x0E,0x00, // 'b'
        0x00,0x00,0x00,0x80,0x80,0x80,0x00,0x00,0x00,0x0E,0x11,0x20,0x20,0x20,0x11,0x00, // 'c'
        0x00,0x00,0x00,0x80,0x80,0x88,0xF8,0x00,0x00,0x0E,0x11,0x20,0x20,0x10,0x3F,0x20, // 'd'
        0x00,0x00,0x80,0x80,0x80,0x80,0x00,0x00,0x00,0x1F,0x22,0x22,0x22,0x22,0x13,0x00, // 'e'
        0x00,0x80,0x80,0xF0,0x88,0x88,0x88,0x18,0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'f'
        0x00,0x00,0x80,0x80,0x80,0x80,0x80,0x00,0x00,0x6B,0x94,0x94,0x94,0x93,0x60,0x00, // 'g'
        0x08,0xF8,0x00,0x80,0x80,0x80,0x00,0x00,0x20,0x3F,0x21,0x00,0x00,0x20,0x3F,0x20, // 'h'
        0x00,0x80,0x98,0x98,0x00,0x00,0x00,0x00,0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'i'
        0x00,0x00,0x00,0x98,0x98,0x00,0x00,0x00,0x00,0xC0,0x80,0x80,0x80,0x7F,0x00,0x00, // 'j'
        0x08,0xF8,0x00,0x00,0x80,0x80,0x80,0x00,0x20,0x3F,0x24,0x02,0x2D,0x30,0x20,0x00, // 'k'
        0x00,0x08,0x08,0xF8,0x00,0x00,0x00,0x00,0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'l'
        0x80,0x80,0x80,0x80,0x80,0x80,0x80,0x00,0x20,0x3F,0x20,0x00,0x3F,0x20,0x00,0x3F, // 'm'
        0x80,0x80,0x00,0x80,0x80,0x80,0x00,0x00,0x20,0x3F,0x21,0x00,0x00,0x20,0x3F,0x20, // 'n'
        0x00,0x00,0x80,0x80,0x80,0x80,0x00,0x00,0x00,0x1F,0x20,0x20,0x20,0x20,0x1F,0x00, // 'o'
        0x80,0x80,0x00,0x80,0x80,0x00,0x00,0x00,0x80,0xFF,0xA1,0x20,0x20,0x11,0x0E,0x00, // 'p'
        0x00,0x00,0x00,0x80,0x80,0x80,0x80,0x00,0x00,0x0E,0x11,0x20,0x20,0xA0,0xFF,0x80, // 'q'
        0x80,0x80,0x80,0x00,0x80,0x80,0x80,0x00,0x20,0x20,0x3F,0x21,0x20,0x00,0x01,0x00, // 'r'
        0x00,0x00,0x80,0x80,0x80,0x80,0x80,0x00,0x00,0x33,0x24,0x24,0x24,0x24,0x19,0x00, // 's'
        0x00,0x80,0x80,0xE0,0x80,0x80,0x00,0x00,0x00,0x00,0x00,0x1F,0x20,0x20,0x00,0x00, // 't'
        0x80,0x80,0x00,0x00,0x00,0x80,0x80,0x00,0x00,0x1F,0x20,0x20,0x20,0x10,0x3F,0x20, // 'u'
        0x80,0x80,0x80,0x00,0x80,0x80,0x80,0x00,0x00,0x01,0x0E,0x30,0x08,0x06,0x01,0x00, // 'v'
        0x80,0x80,0x00,0x80,0x00,0x80,0x80,0x00,0x0F,0x30,0x0C,0x03,0x0C,0x30,0x0F,0x00, // 'w'
        0x00,0x80,0x80,0x00,0x00,0x80,0x80,0x00,0x00,0x20,0x31,0x2E,0x0E,0x31,0x20,0x00, // 'x'
        0x80,0x80,0x80,0x00,0x00,0x80,0x80,0x80,0x80,0x81,0x8E,0x70,0x18,0x06,0x01,0x00, // 'y'
        0x00,0x80,0x80,0x80,0x00,0x80,0x80,0x00,0x00,0x21,0x30,0x2C,0x22,0x21,0x30,0x00, // 'z'
        0x00,0x00,0x00,0x00,0x80,0x7C,0x02,0x02,0x00,0x00,0x00,0x38,0x40,0x40,0x40,0x00, // '{'
        0x00,0x00,0x00,0xFF,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0x00,0x00,0x00,0x00, // '|'
        0x00,0x02,0x02,0x7C,0x80,0x00,0x00,0x00,0x00,0x40,0x40,0x40,0x38,0x00,0x00,0x00, // '}'
        0x00,0x06,0x01,0x01,0x02,0x02,0x04,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // '~'
    ]

    // Fuente extra: vocales con acento (may./min.) y ñ/Ñ (8×16px).
    // Orden: á, é, í, ó, ú, Á, É, Í, Ó, Ú, ñ, Ñ
    const OLED_FONT_EXTRA_CODES: number[] = [225, 233, 237, 243, 250, 193, 201, 205, 211, 218, 241, 209]
    const OLED_FONT_EXTRA: number[] = [
        0x00,0x00,0x80,0xA0,0x90,0x80,0x00,0x00,
        0x00,0x19,0x24,0x22,0x22,0x22,0x3F,0x20, // 'á'
        0x00,0x00,0x80,0xA0,0x90,0x80,0x00,0x00,
        0x00,0x1F,0x22,0x22,0x22,0x22,0x13,0x00, // 'é'
        0x00,0x80,0x80,0xA0,0x10,0x00,0x00,0x00,
        0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'í'
        0x00,0x00,0x80,0xA0,0x90,0x80,0x00,0x00,
        0x00,0x1F,0x20,0x20,0x20,0x20,0x1F,0x00, // 'ó'
        0x80,0x80,0x00,0x20,0x10,0x80,0x80,0x00,
        0x00,0x1F,0x20,0x20,0x20,0x10,0x3F,0x20, // 'ú'
        0x00,0x00,0xC0,0x3C,0xE2,0x00,0x00,0x00,
        0x20,0x3C,0x23,0x02,0x02,0x27,0x38,0x20, // 'Á'
        0x08,0xF8,0x88,0x8C,0xEA,0x08,0x10,0x00,
        0x20,0x3F,0x20,0x00,0x03,0x00,0x00,0x00, // 'É'
        0x00,0x08,0x08,0xFC,0x0A,0x08,0x00,0x00,
        0x00,0x20,0x20,0x3F,0x20,0x20,0x00,0x00, // 'Í'
        0xE0,0x10,0x08,0x0C,0x0A,0x10,0xE0,0x00,
        0x0F,0x10,0x20,0x20,0x20,0x10,0x0F,0x00, // 'Ó'
        0x08,0xF8,0x08,0x04,0x02,0x08,0xF8,0x08,
        0x00,0x1F,0x20,0x20,0x20,0x20,0x1F,0x00, // 'Ú'
        0x80,0xA0,0x10,0xA0,0x90,0xA0,0x00,0x00,
        0x20,0x3F,0x21,0x00,0x00,0x20,0x3F,0x20, // 'ñ'
        0x08,0xFA,0x31,0xC2,0x01,0x0A,0xF8,0x08,
        0x20,0x3F,0x20,0x00,0x07,0x18,0x3F,0x00, // 'Ñ'
    ]

    function oledCmd(cmd: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = cmd & 0xFF
        pins.i2cWriteBuffer(OLED_ADDR, buf)
    }

    function oledData(data: Buffer): void {
        let buf = pins.createBuffer(data.length + 1)
        buf[0] = 0x40
        for (let i = 0; i < data.length; i++) {
            buf[i + 1] = data[i]
        }
        pins.i2cWriteBuffer(OLED_ADDR, buf)
    }

    function initOled(): void {
        oledCmd(0xAE)       // display off
        oledCmd(0xA4)       // display resume
        oledCmd(0xD5); oledCmd(0xF0) // clock div
        oledCmd(0xA8); oledCmd(0x3F) // multiplex
        oledCmd(0xD3); oledCmd(0x00) // display offset
        oledCmd(0x40)                // start line
        oledCmd(0x8D); oledCmd(0x14) // charge pump on
        oledCmd(0x20); oledCmd(0x00) // memory mode horizontal
        oledCmd(0xA1)                // seg remap
        oledCmd(0xC8)                // com scan dec
        oledCmd(0xDA); oledCmd(0x12) // com pins
        oledCmd(0x81); oledCmd(0xCF) // contrast
        oledCmd(0xD9); oledCmd(0xF1) // precharge
        oledCmd(0xDB); oledCmd(0x40) // vcom detect
        oledCmd(0xA6)                // normal display
        oledCmd(0xAF)                // display on
        _oledInitialized = true
        clearOled()
    }

    function ensureOledInit(): void {
        if (!_oledInitialized) initOled()
    }

    function clearOled(): void {
        for (let page = 0; page < 8; page++) {
            oledCmd(0xB0 | page)
            oledCmd(0x00)
            oledCmd(0x10)
            let blank = pins.createBuffer(128)
            blank.fill(0)
            oledData(blank)
        }
    }

    // Limpia las 2 páginas que ocupa una fila de texto.
    function clearFila(fila: number): void {
        const pageTop = fila * 2
        let blank = pins.createBuffer(128)
        blank.fill(0)
        for (let p = 0; p < 2; p++) {
            oledCmd(0xB0 | (pageTop + p))
            oledCmd(0x00)
            oledCmd(0x10)
            oledData(blank)
        }
    }

    // Obtiene los 16 bytes de bitmap para un código de carácter.
    function getCharBitmap(code: number): number[] {
        for (let i = 0; i < OLED_FONT_EXTRA_CODES.length; i++) {
            if (OLED_FONT_EXTRA_CODES[i] === code) {
                const base = i * 16
                let bmp: number[] = []
                for (let j = 0; j < 16; j++) bmp.push(OLED_FONT_EXTRA[base + j])
                return bmp
            }
        }
        const idx = (code >= 32 && code <= 126) ? code - 32 : 0
        const base = idx * 16
        let bmp: number[] = []
        for (let j = 0; j < 16; j++) bmp.push(OLED_FONT8x16[base + j])
        return bmp
    }

    function writeChar(ch: number, fila: number, col: number): void {
        const bmp = getCharBitmap(ch)
        const pageTop = fila * 2
        const pixCol = col * CHAR_W

        oledCmd(0xB0 | pageTop)
        oledCmd(0x00 | (pixCol & 0x0F))
        oledCmd(0x10 | (pixCol >> 4))
        let top = pins.createBuffer(8)
        for (let i = 0; i < 8; i++) top[i] = bmp[i]
        oledData(top)

        oledCmd(0xB0 | (pageTop + 1))
        oledCmd(0x00 | (pixCol & 0x0F))
        oledCmd(0x10 | (pixCol >> 4))
        let bot = pins.createBuffer(8)
        for (let i = 0; i < 8; i++) bot[i] = bmp[8 + i]
        oledData(bot)
    }

    // STV2-14 — Escribe texto en el OLED (I2C), fila 0-3, columna 0-15.
    // Reutiliza el enum SabanaColumna16 definido en lcd.ts.
    /**
     * Writes text or a number on the OLED screen.
     */
    //% blockId=oled_escribir
    //% block="OLED │ Write %texto on row %fila at column %columna on I2C pin"
    //% texto.shadow=text texto.defl="abc"
    //% group="SCREENS" color="#35BFE9" weight=100 blockGap=8
    export function oledEscribir(texto: string | number, fila: SabanaOledFila, columna: SabanaColumna16): void {
        ensureOledInit()
        clearFila(fila)
        const s = "" + texto
        for (let i = 0; i < s.length; i++) {
            const c = columna + i
            if (c >= OLED_COLS) break
            writeChar(s.charCodeAt(i), fila, c)
        }
    }

    // STV2-15 — Borra todos los textos del OLED (I2C).
    /**
     * Clears everything on the OLED screen.
     */
    //% blockId=oled_borrar
    //% block="OLED │ clear text on I2C pin"
    //% group="SCREENS" color="#35BFE9" weight=95 blockGap=8
    export function oledBorrar(): void {
        ensureOledInit()
        clearOled()
    }

    // ===================== motor_multicolor =====================
    export enum SabanaColorMotor {
        //% block="🔴"
        Rojo = 0,
        //% block="🟢"
        Verde = 1,
        //% block="🟡"
        Amarillo = 2,
        //% block="🔵"
        Azul = 3,
    }

    export enum SabanaMovimientoMotorUnico {
        //% block="Rotate right"
        Derecha = 0,
        //% block="Rotate left"
        Izquierda = 1,
        //% block="Brake"
        Frenar = 2,
    }

    // Direcciones I2C por color, verificadas en version-alex/block/servoMotor.ts
    // (enum MotorAddr: Red=0x51, Green=0x52, Blue=0x53, Yellow=0x54).
    function colorMotorToAddr(color: SabanaColorMotor): number {
        switch (color) {
            case SabanaColorMotor.Rojo: return 0x51
            case SabanaColorMotor.Verde: return 0x52
            case SabanaColorMotor.Azul: return 0x53
            case SabanaColorMotor.Amarillo: return 0x54
        }
        return 0x51
    }

    // Protocolo real portado de EXT4/archivadas/motores-original.ts -> runMotor()
    // (idéntico al run() de version-alex/block/servoMotor.ts).
    function motorMulticolorEnviar(addr: number, speed: number): void {
        speed = speed / 2
        let speedBuff = 0
        if (speed < 0) {
            speed = -speed
            speedBuff = ((~speed) + 1) | 0x80
        } else {
            speedBuff = speed
        }
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        buf.setNumber(NumberFormat.UInt8BE, 1, speedBuff)
        buf.setNumber(NumberFormat.UInt8BE, 2, 0)
        buf.setNumber(NumberFormat.UInt8BE, 3, 0)
        pins.i2cWriteBuffer(addr, buf)
    }

    // STV2-16 — Controla un motor individual (identificado por color/emoji)
    // conectado por I2C. El botón "+" agrega el parámetro opcional de velocidad.
    // Derecha = velocidad positiva, Izquierda = velocidad negativa, Frenar = 0.
    /**
     * Spins one motor. Use + to choose the speed (0 to 100).
     */
    //% blockId=motor_multicolor
    //% block="Motor │ %color %movimiento on I2C pin || Speed %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% expandableArgumentMode="toggle"
    //% group="MOTORS" color="#35BFE9" weight=98 blockGap=8
    export function motorMulticolor(
        color: SabanaColorMotor,
        movimiento: SabanaMovimientoMotorUnico,
        velocidad = 50
    ): void {
        const addr = colorMotorToAddr(color)
        velocidad = Math.constrain(velocidad, 0, 100)
        let speed = 0
        if (movimiento == SabanaMovimientoMotorUnico.Derecha) speed = velocidad
        else if (movimiento == SabanaMovimientoMotorUnico.Izquierda) speed = -velocidad
        motorMulticolorEnviar(addr, speed)
    }

    // ===================== servo =====================
    // STV2-20 — Servo motor en un puerto GPIO, grado de 0 a 180°.
    /**
     * Moves the servo to the chosen angle (0 to 180°).
     */
    //% blockId=servo
    //% block="Servo │ %grado° on pin %puerto"
    //% grado.min=0 grado.max=180 grado.defl=0
    //% group="MOTORS" color="#FFB800" weight=100 blockGap=8
    export function servo(grado: number, puerto: SabanaPuerto): void {
        pins.servoWritePin(puertoToAnalogPin(puerto), Math.constrain(grado, 0, 180))
    }

    // ===================== helice =====================
    // STV2-21 — Hélice en un puerto GPIO, simple ON/OFF. Reutiliza el enum
    // SabanaEstadoOnOff definido en led.ts (se descarta el control de
    // dirección de SabanaMovimientoMotorUnico).
    /**
     * Turns the propeller on or off.
     */
    //% blockId=helice
    //% block="Propeller │ %estado on pin %puerto"
    //% group="MOTORS" color="#FFB800" weight=99 blockGap=8
    export function helice(estado: SabanaEstadoOnOff, puerto: SabanaPuerto): void {
        const pin = puertoToDigitalPin(puerto)
        pins.digitalWritePin(pin, estado == SabanaEstadoOnOff.ON ? 1 : 0)
    }

    // ===================== movimiento =====================
    export enum SabanaMovimiento {
        //% block="Forward"
        Avanzar = 0,
        //% block="Backward"
        Retroceder = 1,
        //% block="Turn Left"
        GirarIzquierda = 2,
        //% block="Turn Right"
        GirarDerecha = 3,
        //% block="Brake"
        Frenar = 4,
    }

    export enum SabanaAvanceRetroceso {
        //% block="Forward"
        Avanzar = 0,
        //% block="Backward"
        Retroceder = 1,
    }

    export enum SabanaDireccionGiro {
        //% block="Turn left"
        Izquierda = 0,
        //% block="Turn right"
        Derecha = 1,
    }

    // ── Motor real portado de EXT4/blocks/smartteam4/motores.ts ───────

    // Motor IZQUIERDO = ROJO (0x51) o AZUL (0x53)
    // Motor DERECHO   = VERDE (0x52) o AMARILLO (0x54)
    // La orden de cada lado se manda a sus dos colores posibles; el color que
    // no esté conectado no responde (i2cWriteBuffer devuelve error, sin colgar).
    // Polaridad igual a logos-smart (runDual): adelante = izquierdo −, derecho +.
    const MOVIMIENTO_IZQ_ROJO = 0x51
    const MOVIMIENTO_IZQ_AZUL = 0x53
    const MOVIMIENTO_DER_VERDE = 0x52
    const MOVIMIENTO_DER_AMARILLO = 0x54

    // Medidas del robot (confirmadas por el usuario, 2026-10-25)
    const MOVIMIENTO_DIAMETRO_RUEDA_CM = 5.5
         // diámetro de la rueda
    const MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM = 3.14159 * MOVIMIENTO_DIAMETRO_RUEDA_CM
    const MOVIMIENTO_DIST_ENTRE_RUEDAS_CM = 9.5
      // de centro a centro de rueda

    // "Por cm" y "girar" usan el modo 0x04 del motor (protocolo del proveedor,
    // igual que logos-smart moveRel/gotoDual): "desplazamiento relativo" — la
    // rueda gira N grados exactos medidos por su propio sensor, frena sola y
    // reporta su estado en el byte 5: 4 = moviendo, 11 = terminó, 10 = trabada.
    const MOVIMIENTO_ESTADO_MOVIENDO = 4
    const MOVIMIENTO_ESTADO_FIN = 11
    const MOVIMIENTO_ESTADO_TRABADO = 10
    // Si ninguna rueda avanza durante este tiempo se corta (nunca se cuelga).
    const MOVIMIENTO_SIN_AVANCE_MS = 2000

    function movimientoEscribirMotor(address: number, speedRaw: number): void {
        const half = speedRaw / 2
        let speedBuff = 0
        if (half < 0) {
            const s = -half
            speedBuff = ((~s) + 1) | 0x80
        } else {
            speedBuff = half
        }
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        buf.setNumber(NumberFormat.UInt8BE, 1, speedBuff)
        buf.setNumber(NumberFormat.UInt8BE, 2, 0)
        buf.setNumber(NumberFormat.UInt8BE, 3, 0)
        pins.i2cWriteBuffer(address, buf)
    }

    // speed1 = rueda derecha, speed2 = rueda izquierda (ver movimientoASpeeds)
    function movimientoRunDual(speed1: number, speed2: number): void {
        movimientoEscribirMotor(MOVIMIENTO_DER_VERDE, speed1)
        movimientoEscribirMotor(MOVIMIENTO_DER_AMARILLO, speed1)
        movimientoEscribirMotor(MOVIMIENTO_IZQ_ROJO, speed2)
        movimientoEscribirMotor(MOVIMIENTO_IZQ_AZUL, speed2)
    }

    // Manda "girar N grados" (modo 0x04) a un motor. Devuelve true si el motor
    // respondió, o sea si ese color está conectado (i2cWriteBuffer devuelve 0).
    // En el simulador de MakeCode no devuelve 0, así que no se espera nada.
    function movimientoGirarRueda(address: number, velocidad: number, grados: number): boolean {
        let g = Math.round(grados)
        if (g > 32400) g = 32400
        if (g < -32400) g = -32400
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x04)
        buf.setNumber(NumberFormat.UInt8BE, 1, Math.max(1, Math.round(velocidad / 2)))
        buf.setNumber(NumberFormat.Int16BE, 2, g)
        return pins.i2cWriteBuffer(address, buf) == 0
    }

    // Espera a que todos los motores indicados terminen (o se traben).
    function movimientoEsperarFin(motores: number[]): void {
        // 1) Esperar a que arranquen: justo después de la orden el estado
        //    puede seguir en "terminó" por el movimiento anterior.
        const inicio = control.millis()
        while (control.millis() - inicio < 300) {
            let alguno = false
            for (let a of motores) {
                if (pins.i2cReadBuffer(a, 6)[5] == MOVIMIENTO_ESTADO_MOVIENDO) alguno = true
            }
            if (alguno) break
            basic.pause(5)
        }
        // 2) Esperar fin/trabado de todos, mirando que las ruedas avancen.
        let posAnterior: number[] = []
        for (let i = 0; i < motores.length; i++) posAnterior.push(-99999)
        let ultimoAvance = control.millis()
        while (true) {
            let terminados = 0
            for (let i = 0; i < motores.length; i++) {
                const b = pins.i2cReadBuffer(motores[i], 6)
                const estado = b[5]
                if (estado == MOVIMIENTO_ESTADO_FIN || estado == MOVIMIENTO_ESTADO_TRABADO) terminados++
                const pos = b.getNumber(NumberFormat.Int16BE, 1)
                if (pos != posAnterior[i]) {
                    posAnterior[i] = pos
                    ultimoAvance = control.millis()
                }
            }
            if (terminados == motores.length) return
            if (control.millis() - ultimoAvance > MOVIMIENTO_SIN_AVANCE_MS) {
                movimientoRunDual(0, 0)
                return
            }
            basic.pause(10)
        }
    }

    // Gira la rueda derecha y la izquierda N grados (con signo) y espera.
    function movimientoGradosDual(gradosDerecha: number, gradosIzquierda: number, velocidad: number): void {
        let conectados: number[] = []
        if (movimientoGirarRueda(MOVIMIENTO_DER_VERDE, velocidad, gradosDerecha)) conectados.push(MOVIMIENTO_DER_VERDE)
        if (movimientoGirarRueda(MOVIMIENTO_DER_AMARILLO, velocidad, gradosDerecha)) conectados.push(MOVIMIENTO_DER_AMARILLO)
        if (movimientoGirarRueda(MOVIMIENTO_IZQ_ROJO, velocidad, gradosIzquierda)) conectados.push(MOVIMIENTO_IZQ_ROJO)
        if (movimientoGirarRueda(MOVIMIENTO_IZQ_AZUL, velocidad, gradosIzquierda)) conectados.push(MOVIMIENTO_IZQ_AZUL)
        if (conectados.length > 0) movimientoEsperarFin(conectados)
    }

    // s1 = rueda derecha, s2 = rueda izquierda (motores montados en espejo)
    function movimientoASpeeds(movimiento: SabanaMovimiento, velocidad: number): { s1: number; s2: number } {
        switch (movimiento) {
            case SabanaMovimiento.Avanzar:
                return { s1: velocidad, s2: -velocidad }
            case SabanaMovimiento.Retroceder:
                return { s1: -velocidad, s2: velocidad }
            case SabanaMovimiento.GirarDerecha:
                return { s1: -velocidad, s2: -velocidad }
            case SabanaMovimiento.GirarIzquierda:
                return { s1: velocidad, s2: velocidad }
            case SabanaMovimiento.Frenar:
                return { s1: 0, s2: 0 }
        }
        return { s1: 0, s2: 0 }
    }

    // STV2-17 — Movimiento simple del robot. Bloque directo, sin botón "+".
    /**
     * Moves the robot at the chosen speed (0 to 100).
     */
    //% blockId=movimiento_simple
    //% block="%movimiento │ Speed %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% group="MOVEMENT" color="#35BFE9" weight=100 blockGap=8
    export function movimientoSimple(movimiento: SabanaMovimiento, velocidad: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        const { s1, s2 } = movimientoASpeeds(movimiento, velocidad)
        movimientoRunDual(s1, s2)
    }

    // STV2-18 — Movimiento por una distancia en cm. Bloque directo, sin
    // botón "+". Solo Avanzar/Retroceder (no incluye giros ni frenar).
    /**
     * Moves forward or backward the chosen centimeters, then stops.
     */
    //% blockId=movimiento_cm
    //% block="%movimiento │ Speed %velocidad for %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=1 cm.max=500 cm.defl=10
    //% group="MOVEMENT" color="#35BFE9" weight=90 blockGap=8
    export function movimientoCm(movimiento: SabanaAvanceRetroceso, velocidad: number, cm: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        if (velocidad <= 0 || cm <= 0) return
        const mov = movimiento == SabanaAvanceRetroceso.Avanzar
            ? SabanaMovimiento.Avanzar
            : SabanaMovimiento.Retroceder
        // Grados de rueda = cm × 360 / circunferencia
        const grados = cm * 360 / MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM
        const { s1, s2 } = movimientoASpeeds(mov, 1)   // signo de cada rueda
        movimientoGradosDual(s1 * grados, s2 * grados, velocidad)
    }

    // STV2-19 — Gira el robot un ángulo determinado. Bloque directo, sin
    // botón "+". La palabra "Girar" es parte del texto del desplegable
    // (SabanaDireccionGiro), no del texto fijo del bloque.
    /**
     * Turns the robot the chosen degrees, then stops.
     */
    //% blockId=movimiento_girar
    //% block="%direccion │ Speed %velocidad angle %angulo"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% angulo.min=0 angulo.max=360 angulo.defl=90
    //% group="MOVEMENT" color="#35BFE9" weight=80 blockGap=8
    export function movimientoGirar(direccion: SabanaDireccionGiro, velocidad: number, angulo: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        if (angulo <= 0 || velocidad <= 0) return
        const mov = direccion == SabanaDireccionGiro.Izquierda
            ? SabanaMovimiento.GirarIzquierda
            : SabanaMovimiento.GirarDerecha
        // Giro en el lugar: cada rueda recorre π·W·ángulo/360, que en grados
        // de rueda es ángulo × W / D.
        const grados = angulo * MOVIMIENTO_DIST_ENTRE_RUEDAS_CM / MOVIMIENTO_DIAMETRO_RUEDA_CM
        const { s1, s2 } = movimientoASpeeds(mov, 1)   // signo de cada rueda
        movimientoGradosDual(s1 * grados, s2 * grados, velocidad)
    }

    // ===================== seguidor_linea =====================
    const SEGUIDOR_LINEA_I2C_ADDR = 0x28

    export enum SabanaSeguidorLineaLado {
        //% block="Right"
        Derecha = 2,
        //% block="Center"
        Centro = 1,
        //% block="Left"
        Izquierda = 0,
    }

    // Acción de motores para cada renglón del bloque
    // seguidor_de_linea_acciones. Solo 3 opciones (sin Retroceder ni Frenar).
    // Se mapea a SabanaMovimiento en seguidorAccionToMovimiento().
    export enum SabanaSeguidorAccion {
        //% block="Turn right"
        GirarDerecha = 0,
        //% block="Turn left"
        GirarIzquierda = 1,
        //% block="Forward"
        Avanzar = 2,
    }

    // Diseño visual final (confirmado 2026-08-26): lectura booleana por lado
    // (Derecha/Centro/Izquierda), color celeste I2C. Lectura de 5 bytes según
    // protocolo real (Protocolo-I2C/line_foollower_en.md): Byte0=Izquierda,
    // Byte1=Centro, Byte2=Derecha, Byte3-4=Reservado. El dropdown muestra las
    // opciones en orden Derecha/Centro/Izquierda.
    /**
     * Detects whether that side of the follower is on the black line.
     */
    //% blockId=seguidor_de_linea
    //% block="Line Follower │ %lado on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=92 blockGap=8
    export function seguidorDeLinea(lado: SabanaSeguidorLineaLado): boolean {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)
        return buf[lado] == 1
    }

    // Mapea la opción del desplegable del seguidor de línea al enum real
    // de movimiento del robot (movimiento.ts).
    function seguidorAccionToMovimiento(accion: SabanaSeguidorAccion): SabanaMovimiento {
        switch (accion) {
            case SabanaSeguidorAccion.GirarDerecha: return SabanaMovimiento.GirarDerecha
            case SabanaSeguidorAccion.GirarIzquierda: return SabanaMovimiento.GirarIzquierda
            case SabanaSeguidorAccion.Avanzar: return SabanaMovimiento.Avanzar
        }
        return SabanaMovimiento.Frenar
    }

    // Empaqueta acción (bits altos) + velocidad 0-100 (bits bajos) en un
    // solo número. Blockly no permite que dos parámetros sueltos compartan
    // una fila (cada %param fuerza su propia fila — confirmado en
    // pxt/pxtblocks/loader.ts, función splitInputs); agrupar accion+
    // velocidad en un shadow con inlineInputMode=inline es la forma
    // estándar de MakeCode de tener "desplegable + campo" en un renglón
    // (mismo patrón que tira_rgb.ts usa para empaquetar RGB en un color).
    function seguidorAccionCodificar(accion: SabanaSeguidorAccion, velocidad: number): number {
        let v = Math.round(velocidad)
        if (v < 0) v = 0
        if (v > 100) v = 100
        return (accion << 8) | v
    }
    /**
     * Movement and speed (0 to 100) for this sensor.
     */
    //% blockId=seguidor_accion_derecha
    //% block="$accion Speed $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarIzquierda
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionDerecha(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }
    /**
     * Movement and speed (0 to 100) for this sensor.
     */
    //% blockId=seguidor_accion_centro
    //% block="$accion Speed $velocidad"
    //% accion.defl=SabanaSeguidorAccion.Avanzar
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionCentro(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }
    /**
     * Movement and speed (0 to 100) for this sensor.
     */
    //% blockId=seguidor_accion_izquierda
    //% block="$accion Speed $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarDerecha
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionIzquierda(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    // Decodifica el número empaquetado del shadow y ejecuta el movimiento.
    function seguidorEjecutarCodificado(codigo: number): void {
        const accion = (codigo >> 8) as SabanaSeguidorAccion
        const velocidad = codigo & 0xFF
        movimientoSimple(seguidorAccionToMovimiento(accion), velocidad)
    }

    // Bloque de acción del seguidor de línea (I2C 0x28). Reemplaza al
    // antiguo seguidor_de_linea_ramas (ramas con huecos).
    //
    // Un renglón por sensor (Derecha / Centro / Izquierda). Cada renglón
    // recibe un shadow block "desplegable + Velocidad" (arriba) como único
    // parámetro; el bloque principal usa inlineInputMode=external para que
    // cada renglón (cada shadow) caiga en su propia fila.
    //
    // Lectura única por ejecución (para usar dentro de "por siempre"). Un
    // renglón se activa cuando SU sensor detecta BLANCO (buf == 0), es
    // decir, cuando ese lado se salió de la línea negra. Los 3 renglones
    // son IFs independientes, evaluados en orden Derecha → Centro →
    // Izquierda; la última orden enviada a los motores es la que queda.
    // Si ningún sensor ve blanco, no se envía nada a los motores.
    //
    // La lógica de motores NO se duplica: se reutiliza movimientoSimple()
    // de movimiento.ts (izquierdo = rojo 0x51 / azul 0x53, derecho = verde 0x52 / amarillo 0x54).
    /**
     * Chooses what the robot does when each sensor leaves the line.
     */
    //% blockId=seguidor_de_linea_acciones
    //% block="Line Follower │ on I2C pin|Right $derecha|Center $centro|Left $izquierda"
    //% derecha.shadow=seguidor_accion_derecha
    //% centro.shadow=seguidor_accion_centro
    //% izquierda.shadow=seguidor_accion_izquierda
    //% inlineInputMode=external
    //% group="SENSORS" color="#35BFE9" weight=91.95 blockGap=8
    export function seguidorDeLineaAcciones(derecha: number, centro: number, izquierda: number): void {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)

        // 0 = blanco = se salió de la línea negra → ejecutar acción del renglón
        if (buf[SabanaSeguidorLineaLado.Derecha] == 0) seguidorEjecutarCodificado(derecha)
        if (buf[SabanaSeguidorLineaLado.Centro] == 0) seguidorEjecutarCodificado(centro)
        if (buf[SabanaSeguidorLineaLado.Izquierda] == 0) seguidorEjecutarCodificado(izquierda)
    }
}
