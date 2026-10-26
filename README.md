# EXT6 — STEAMbit 6

Extensión MakeCode para micro:bit, categoría **STEAMbit 6**. Versión **4.0.0**.

## Cómo agregarla en MakeCode

1. En MakeCode, **Extensiones** → pegar `https://github.com/LOGOS-SmartTEAM/EXT6` y elegirla.
2. Aparece la categoría **STEAMbit 6** en la caja de herramientas.

### Actualizar en un proyecto existente

Los proyectos quedan fijados a la versión con la que se agregó la extensión. Para tener la 4.0.0:
en el Explorador del proyecto (debajo del simulador), actualizar la extensión, o quitarla y volver a agregarla.

## Idiomas

Español, inglés y portugués: los bloques y sus ayudas se muestran en el idioma elegido en MakeCode
(Configuración → Idioma). Cualquier otro idioma muestra inglés.

## Bloques


### SENSORES

| Bloque | Qué hace |
|---|---|
| Botón │ en pin … | Devuelve 1 si el botón está presionado y 0 si está suelto. |
| Sensor de Suelo │ en pin … | Mide la humedad de la tierra (0 a 1023). |
| Potenciómetro │ en pin … | Lee la posición de la perilla (0 a 1023). |
| Sensor de Luz │ en pin … | Mide la luz: 0 = oscuro, 1023 = mucha luz. |
| Ultrasonido │ en pin I2C | Mide la distancia a un objeto en centímetros (0 a 200). |
| … │ en pin I2C | Mide la temperatura (°C) o la humedad (%). |
| Seguidor de líneas │ … en pin I2C | Detecta si ese lado del seguidor está sobre la línea negra. |
| Seguidor de líneas │ en pin I2C / Derecha … / Centro … / Izquierda … | Elige qué hace el robot cuando cada sensor se sale de la línea. |

### SALIDAS

| Bloque | Qué hace |
|---|---|
| LED │ Estado … en pin … | Prende o apaga el LED. |
| LED │ Intensidad … en pin … | Ajusta el brillo del LED: 0 = apagado, 1023 = máximo. |
| Tira RGB │ … … … … … … en pin I2C | Elige el color de cada uno de los 6 LEDs de la tira. |
| Tira RGB │ ajustada a R … G … B … | Prende toda la tira con la mezcla de rojo, verde y azul (0 a 255). |
| Tira RGB │ apagar todos | Apaga todos los LEDs de la tira. |

### MOVIMIENTO

| Bloque | Qué hace |
|---|---|
| … │ Velocidad … | Mueve el robot a la velocidad elegida (0 a 100). |
| … │ Velocidad … por … cm | Avanza o retrocede los centímetros elegidos y se detiene. |
| … │ Velocidad … ángulo de … | Gira el robot los grados elegidos y se detiene. |

### MOTORES

| Bloque | Qué hace |
|---|---|
| Servo │ …° en pin … | Mueve el servo al ángulo elegido (0 a 180°). |
| Hélice │ … en pin … | Prende o apaga la hélice. |
| Motor │ … … en pin I2C  Velocidad … | Hace girar un motor. Con + elegís la velocidad (0 a 100). |

### PANTALLAS

| Bloque | Qué hace |
|---|---|
| OLED │ Escribir … en fila … en columna … en pin I2C | Escribe un texto o un número en la pantalla OLED. |
| OLED │ borrar textos en pin I2C | Borra todo lo escrito en la pantalla OLED. |

## Estructura

```
bloques.ts        ← todos los bloques (un solo archivo), generado desde STV2-PADRE
main.ts           ← solo descripción
test.ts           ← pruebas rápidas (no se incluyen al usar la extensión)
_locales/es, pt   ← traducciones (el código está en inglés)
pxt.json          ← nombre, versión y lista de archivos
```

Los bloques se corrigen en **STV2-PADRE** y se regenera este archivo.

## Licencia

MIT
