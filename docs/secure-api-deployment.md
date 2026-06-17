# Entorno seguro para API

Esta API no fuerza HTTPS dentro de Express para no romper Docker local. La opción recomendada para despliegue es terminar HTTPS en el proveedor cloud, Hostinger, proxy inverso o balanceador, y reenviar tráfico interno al backend por HTTP.

## Variables recomendadas

- `CORS_ORIGIN`: lista separada por comas con los orígenes públicos permitidos del frontend.

Ejemplo sin valores reales:

```env
CORS_ORIGIN=https://frontend-publico.example
```

## Verificación de despliegue

- El frontend público debe llamar al backend usando una URL `https://`.
- El navegador no debe mostrar errores de mixed content.
- Los endpoints protegidos deben responder con token válido.
- Docker local debe seguir funcionando sin configurar `CORS_ORIGIN`.

## Nota

No guardar certificados ni secretos reales en el repositorio.
