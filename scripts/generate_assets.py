#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Czz Tech - Asset & Layout Generator CLI (Nano Banana)
Gera layouts, mockups e ativos visuais diretamente no workspace.
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import argparse
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
import io as _io

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("[ERRO] GEMINI_API_KEY nao encontrada no .env", file=sys.stderr)
    sys.exit(1)

def generate_layout(prompt: str, output_path: str, aspect_ratio: str = "16:9"):
    client = genai.Client(api_key=API_KEY)
    
    print(f"[Nano Banana] Gerando visual...")
    print(f"[Formato] {aspect_ratio}")
    print(f"[Prompt] {prompt}\n")

    try:
        # Chamada com o modelo de geração de imagens da SDK Google GenAI
        result = client.models.generate_images(
            model="imagen-3.0-generate-002",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=aspect_ratio,
                output_mime_type="image/png"
            )
        )

        for generated_image in result.generated_images:
            image_bytes = generated_image.image.image_bytes
            img = Image.open(_io.BytesIO(image_bytes))

            dest = Path(output_path)
            dest.parent.mkdir(parents=True, exist_ok=True)
            img.save(dest)

            print(f"[OK] Layout gerado e salvo em: {dest.resolve()}")
            return

    except Exception as e:
        print(f"[ERRO] Falha na geracao da imagem: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Gerador de Telas e Ativos da Czz Tech")
    parser.add_argument("-p", "--prompt", required=True, help="Descrição da interface/layout em inglês")
    parser.add_argument("-o", "--output", required=True, help="Caminho do arquivo final (ex: frontend/public/layouts/crm-dashboard.png)")
    parser.add_argument("-a", "--aspect-ratio", default="16:9", choices=["16:9", "9:16", "1:1", "4:3", "3:4"], help="Proporção da imagem")

    args = parser.parse_args()
    generate_layout(args.prompt, args.output, args.aspect_ratio)

if __name__ == "__main__":
    main()
    