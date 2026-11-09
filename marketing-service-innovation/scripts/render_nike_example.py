"""Render the editable example as PDF and PNG pages using LibreOffice and Poppler."""
from argparse import ArgumentParser
from pathlib import Path
from shutil import copy2
from tempfile import TemporaryDirectory
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
parser = ArgumentParser(description=__doc__)
parser.add_argument("--pptx", type=Path, default=root / "referance/nike/nike-example.pptx")
parser.add_argument("--preview", type=Path, default=root / "internal/nike-case/previews/pptx")
args = parser.parse_args()
pptx = args.pptx.resolve()
preview = args.preview.resolve()
preview.mkdir(parents=True, exist_ok=True)
pdf = pptx.with_suffix(".pdf")
environment = os.environ.copy()

with TemporaryDirectory(prefix="mmar-render-") as temp:
    work = Path(temp)
    if sys.platform == "darwin":
        config = work / "fonts.conf"
        config.write_text(
            '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">'
            '<fontconfig><dir>/System/Library/Fonts</dir><dir>/Library/Fonts</dir>'
            f"<cachedir>{temp}/cache</cachedir></fontconfig>"
        )
        environment["FONTCONFIG_FILE"] = str(config)
    subprocess.run(
        ["soffice", "--headless", "--convert-to", "pdf", "--outdir", temp, str(pptx)],
        env=environment, check=True,
    )
    rendered_pdf = work / pdf.name
    subprocess.run(
        ["pdftoppm", "-scale-to", "1600", "-png", str(rendered_pdf), str(work / "slide")],
        check=True,
    )

    pages = {int(p.stem.rsplit("-", 1)[1]): p for p in work.glob("slide-*.png")}
    page_count = len(pages)
    if page_count < 2 or set(pages) != set(range(1, page_count + 1)):
        raise RuntimeError("Expected a cover followed by a contiguous set of rendered body pages.")

    canvas = Image.new("RGB", (1040, 320 * ((page_count + 1) // 2)), "#dddcd4")
    draw = ImageDraw.Draw(canvas)
    for number in range(1, page_count + 1):
        with Image.open(pages[number]) as source:
            image = source.convert("RGB")
        image.thumbnail((500, 282))
        x = 10 + ((number - 1) % 2) * 520
        y = 10 + ((number - 1) // 2) * 320
        canvas.paste(image, (x, y))
        label = "Cover" if number == 1 else f"{number - 1:02} / {page_count - 1:02}"
        draw.text((x + 4, y + 290), label, fill="#212623")

    copy2(rendered_pdf, pdf)
    preview_names = {f"slide-{number}.png" for number in pages}
    for number, source in pages.items():
        copy2(source, preview / f"slide-{number}.png")
    for stale_page in preview.glob("slide-*.png"):
        if re.fullmatch(r"slide-\d+\.png", stale_page.name) and stale_page.name not in preview_names:
            stale_page.unlink()
    canvas.save(preview / "contact-sheet.png")
print(f"Rendered {pdf} and {page_count} PNG pages to {preview}")
