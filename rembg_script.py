import os
from rembg import remove
from PIL import Image

def process(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved {output_path}")
    except Exception as e:
        print(f"Failed: {e}")

process("public/img/burning.png", "public/img/burning_nobg.png")
process("public/img/Skinoutimage.png", "public/img/Skinoutimage_nobg.png")
