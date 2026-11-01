import os
import base64
import pymupdf
import subprocess

def get_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

def get_png_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

img_logo = get_png_base64("sgm_logo.png")
img_chai = get_base64("1.jpeg")
img_face = get_base64("2.jpeg")
img_dant = get_base64("3.jpeg")
img_tulsi = get_base64("4.jpeg")
img_shampoo = get_base64("5.jpeg")
img_cream = get_base64("6.jpeg")
img_agarbatti = get_base64("7.jpeg")
img_berry = get_base64("9_cropped.jpeg")
img_oil = get_base64("10.jpeg")

print(f"Loaded images: logo={len(img_logo)}, chai={len(img_chai)}, face={len(img_face)}, berry={len(img_berry)}")
