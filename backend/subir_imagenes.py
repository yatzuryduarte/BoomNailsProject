
import json
import mimetypes
import re
import unicodedata
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

API = "http://localhost:8080/api"
CARPETA = Path.home() / "Documents" / "images"

# Nombres de archivos que difieren de la referencia en la base de datos.
ALIAS = {
    "toffe": "toffee",
}

def normalizar(texto):
    texto = unicodedata.normalize("NFD", texto.lower())
    texto = "".join(
        caracter for caracter in texto
        if unicodedata.category(caracter) != "Mn"
    )
    return re.sub(r"[^a-z0-9]", "", texto)

def consultar_productos():
    with urlopen(f"{API}/productos", timeout=20) as respuesta:
        return json.loads(respuesta.read().decode("utf-8"))

def subir_imagen(producto_id, archivo, limite):
    tipo_mime = mimetypes.guess_type(archivo.name)[0] or "application/octet-stream"

    partes = []
    for nombre, valor in [
        ("alternativeText", archivo.stem.replace("_", " ").title()),
        ("primary", "true"),
    ]:
        partes.append(
            f"--{limite}\r\n"
            f'Content-Disposition: form-data; name="{nombre}"\r\n\r\n'
            f"{valor}\r\n"
        )

    partes.append(
        f"--{limite}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{archivo.name}"\r\n'
        f"Content-Type: {tipo_mime}\r\n\r\n"
    )

    cuerpo = b"".join(parte.encode("utf-8") for parte in partes)
    cuerpo += archivo.read_bytes()
    cuerpo += f"\r\n--{limite}--\r\n".encode("utf-8")

    solicitud = Request(
        f"{API}/productos/{producto_id}/imagenes",
        data=cuerpo,
        headers={"Content-Type": f"multipart/form-data; boundary={limite}"},
        method="POST",
    )

    with urlopen(solicitud, timeout=30) as respuesta:
        return json.loads(respuesta.read().decode("utf-8"))

def main():
    if not CARPETA.is_dir():
        print(f"No existe la carpeta de imágenes: {CARPETA}")
        return

    productos = consultar_productos()
    productos_por_nombre = {}

    for producto in productos:
        nombre = producto.get("reference") or producto.get("name") or ""
        clave = normalizar(nombre)
        productos_por_nombre.setdefault(clave, []).append(producto)

    archivos = sorted(
        archivo for archivo in CARPETA.iterdir()
        if archivo.is_file()
        and archivo.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
        and archivo.name.lower() != "banner.jpg"
    )

    limite = "----BoomNailsBoundary"
    subidas = 0
    omitidas = 0
    errores = 0

    print(f"Productos consultados: {len(productos)}")
    print(f"Imágenes encontradas: {len(archivos)}\n")

    for archivo in archivos:
        clave = normalizar(archivo.stem)
        clave = ALIAS.get(clave, clave)
        coincidencias = productos_por_nombre.get(clave, [])

        if len(coincidencias) != 1:
            print(f"REVISAR: {archivo.name} — coincidencias: {len(coincidencias)}")
            omitidas += 1
            continue

        producto = coincidencias[0]

        if producto.get("imageUrl"):
            print(f"OMITIDA: {archivo.name} — {producto['name']} ya tiene imagen principal")
            omitidas += 1
            continue

        try:
            resultado = subir_imagen(producto["id"], archivo, limite)
            print(f"OK: {archivo.name} -> {producto['name']} (ID {producto['id']})")
            print(f"    {resultado.get('imageUrl', '')}")
            subidas += 1

        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
            print(f"ERROR: {archivo.name} — {error}")
            errores += 1

    print("\n========== RESUMEN ==========")
    print(f"Imágenes subidas: {subidas}")
    print(f"Omitidas o por revisar: {omitidas}")
    print(f"Errores: {errores}")

if __name__ == "__main__":
    main()
