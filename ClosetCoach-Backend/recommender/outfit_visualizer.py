import os
import random
from PIL import Image, ImageDraw, ImageFont


def normalize_gender(gender):
    gender = gender.lower()
    if gender in ["female", "women", "woman"]:
        return "women"
    if gender in ["male", "men", "man"]:
        return "men"
    raise ValueError("Invalid gender")


def pick_image(folder):
    if not os.path.exists(folder):
        return None

    imgs = [
        f for f in os.listdir(folder)
        if f.lower().endswith((".jpg", ".jpeg"))
    ]
    if not imgs:
        return None

    return os.path.join(folder, random.choice(imgs))


def labeled_block(image, label, size=(256, 256)):
    image = image.resize(size)
    canvas = Image.new("RGB", (size[0], size[1] + 40), "white")
    canvas.paste(image, (0, 40))

    draw = ImageDraw.Draw(canvas)
    draw.rectangle([(0, 0), (size[0], 40)], fill=(240, 240, 240))
    draw.text((10, 10), label, fill="black")

    return canvas


def generate_outfit_image(outfit, gender, occasion, weather):
    gender = normalize_gender(gender)
    base = f"data/deepfashion/visual/{gender}"

    blocks = []

    # --- TOP ---
    top_img = pick_image(os.path.join(base, "top"))
    if top_img:
        blocks.append(
            labeled_block(Image.open(top_img), "TOP")
        )

    # --- BOTTOM ---
    bottom_img = pick_image(os.path.join(base, "pants"))
    if bottom_img:
        blocks.append(
            labeled_block(Image.open(bottom_img), "BOTTOM")
        )

    # --- LAYER ---
    if weather == "cold" and occasion in ["office", "casual"]:
        layer_img = pick_image(os.path.join(base, "jacket"))
        if layer_img:
            blocks.append(
                labeled_block(Image.open(layer_img), "LAYER")
            )

    if not blocks:
        return None

    # --- COMPOSE FINAL IMAGE ---
    width = blocks[0].width
    height = sum(b.height for b in blocks)

    final_img = Image.new("RGB", (width, height), "white")

    y = 0
    for b in blocks:
        final_img.paste(b, (0, y))
        y += b.height

    output = "final_outfit.png"
    final_img.save(output)
    return output
