
#!/bin/bash

set -u

IMAGE_DIR="$HOME/Documents/images"
API_URL="http://localhost:8080/api"
BASE_URL="http://localhost:8080"

# No volver a subir las imágenes que ya están registradas.
# Las diferencias entre nombres se manejan mediante este mapa.
declare -A PRODUCT_IDS=(
  ["amor"]=1
  ["bosque"]=2
  ["canela"]=3
  ["chicle"]=4
  ["eclipse"]=5
  ["limonada"]=6
  ["miel"]=7
  ["misterio"]=8
  ["sueno"]=16
  ["susurro"]=17
  ["suspiro"]=32
  ["ternura"]=33
  ["dulzura"]=36
  ["caramelo"]=37
  ["besito"]=38
  ["romance"]=39
  ["estrella"]=47
  ["candy"]=49
  ["galaxia"]=54
  ["luna"]=55
  ["luz"]=56
  ["oro"]=57
  ["caricia"]=59
  ["diva"]=60
  ["magia"]=61
  ["tesoro"]=62
  ["hada"]=63
  ["sirena"]=64
  ["calma"]=65
  ["princesa"]=66
  ["travesura"]=68
  ["hechizo"]=69
  ["bellota"]=88
  ["explosion"]=89
  ["destello"]=90
  ["chispa"]=91
  ["bombom"]=92
  ["poder x"]=93
  ["crystal"]=100
  ["melodia"]=101
  ["aurora"]=102
  ["toffee"]=103
  ["azucar"]=104
  ["gomita"]=105
  ["cherry"]=106
  ["cupcake"]=107
  ["masmelo"]=108
  ["algodon"]=109
  ["top power"]=110
  ["base power"]=111
)

if ! curl -fsS "$API_URL/productos" >/dev/null; then
  echo "ERROR: Spring Boot no responde en $API_URL"
  exit 1
fi

echo "Servidor disponible."
echo "Revisando imágenes en: $IMAGE_DIR"
echo

for file in "$IMAGE_DIR"/*; do
  [ -f "$file" ] || continue

  filename="$(basename "$file")"
  key="${filename%.*}"
  key="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')"

  # Omitir el banner de la tienda.
  if [ "$key" = "banner" ]; then
    echo "OMITIDO: $filename (banner, no es un producto)"
    continue
  fi

  # No volver a subir Amor, que ya fue registrado.
  if [ "$key" = "amor" ]; then
    echo "OMITIDO: $filename (ya está registrado)"
    continue
  fi

  # Ajustes de nombres que no coinciden exactamente.
  case "$key" in
    sueno) key="sueno" ;;
    oceano) key="oceano" ;;
    toffe) key="toffe" ;;
  esac

  product_id="${PRODUCT_IDS[$key]-}"

  if [ -z "$product_id" ]; then
    echo "PENDIENTE: $filename (sin asociación automática)"
    continue
  fi

  # El servidor acepta JPG, PNG y WEBP.
  case "${filename##*.}" in
    png|PNG) mime="image/png" ;;
    jpg|JPG|jpeg|JPEG) mime="image/jpeg" ;;
    webp|WEBP) mime="image/webp" ;;
    *)
      echo "OMITIDO: $filename (formato no admitido)"
      continue
      ;;
  esac

  echo "Subiendo $filename al producto ID $product_id..."

  response="$(
    curl -sS -X POST "$API_URL/productos/$product_id/imagenes" \
      -F "file=@$file;type=$mime" \
      -F "alternativeText=Esmalte Boom Nails $key" \
      -F "primary=true"
  )" || {
    echo "ERROR al enviar $filename"
    continue
  }

  if printf '%s' "$response" | grep -q '"imageUrl"'; then
    echo "OK: $response"
  else
    echo "ERROR: $response"
  fi
done

echo
echo "Proceso terminado."
