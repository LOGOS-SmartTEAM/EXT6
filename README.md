# SmartTEAM 6

Extensión de MakeCode para micro:bit. Subconjunto de `STV2-PADRE`: toda la
lógica (I2C/GPIO) se traspasó tal cual desde ahí, sin modificarla.

## Cómo se ve en MakeCode

Una sola categoría padre **SmartTEAM 6** (icono de bloque, igual que
SmartTEAM5), color **gris oscuro** (`#424242`). Al hacer clic, aparecen las
subcategorías (groups) con sus bloques.

## Diferencia con STV2-PADRE

No incluye las categorías `VARIABLES` ni `ESPECIAL`. Dentro de `SENSORES`
y `PANTALLAS` solo incluye un subconjunto de bloques.

## Subcategorías y bloques

| Subcategoría | Bloques incluidos |
|--------------|--------------------|
| SENSORES     | Botón, Botón (comparador), Sensor de Suelo, Potenciómetro, Sensor de Luz, Ultrasonido, Ultrasonido (comparador), DHT11 |
| SALIDAS      | LED (Estado), LED (Intensidad), Tira RGB, Tira RGB (ajustada R/G/B), Tira RGB (apagar todos) |
| MOVIMIENTO   | Movimiento simple, Movimiento por cm, Girar |
| MOTORES      | Servo, Hélice, Motor multicolor |
| PANTALLAS    | OLED (Escribir), OLED (borrar) |

No incluye: Sensor de color, Joystick, Seguidor de línea/Sensor de grises,
LCD, Cantidad (VARIABLES), Mensaje Morse (ESPECIAL).
