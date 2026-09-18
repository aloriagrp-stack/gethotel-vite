"""
Image Optimizer Module - In-House WebP Conversion
Uses Pillow (PIL) to fetch, optimize, strip EXIF metadata, and convert images to high-efficiency WebP.
"""
import io
import os
import re
import base64
import httpx
from PIL import Image

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
}

def optimize_image_bytes(image_data: bytes, max_width: int = 1400, quality: int = 82) -> bytes:
    """
    Takes raw image bytes, strips EXIF, resizes proportionally if exceeding max_width,
    and encodes to WebP format.
    """
    image = Image.open(io.BytesIO(image_data))
    
    # Convert RGBA / CMYK to RGB if needed
    if image.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        if image.mode == "P":
            image = image.convert("RGBA")
        background.paste(image, mask=image.split()[-1] if "A" in image.mode else None)
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")

    # Resize proportionally if too large
    if image.width > max_width:
        ratio = max_width / float(image.width)
        new_height = int(float(image.height) * ratio)
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    image.save(output, format="WEBP", quality=quality, method=4)
    return output.getvalue()

async def download_and_convert_webp(image_url: str, save_path: str = None) -> dict:
    """
    Downloads an image from URL or decodes data URI, converts to WebP.
    Returns { success: bool, webp_base64: str, file_path: str, size_bytes: int }
    """
    try:
        # Handle Base64 Data URI
        if image_url.startswith("data:image/"):
            match = re.search(r"base64,(.*)$", image_url)
            if not match:
                return {"success": False, "error": "Invalid base64 image uri"}
            raw_bytes = base64.b64decode(match.group(1))
        else:
            async with httpx.AsyncClient(headers=HEADERS, timeout=20.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(image_url)
                if resp.status_code != 200:
                    return {"success": False, "error": f"Failed to download image. Status {resp.status_code}"}
                raw_bytes = resp.content

        webp_bytes = optimize_image_bytes(raw_bytes)
        
        saved_file = None
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, "wb") as f:
                f.write(webp_bytes)
            saved_file = save_path

        webp_b64 = f"data:image/webp;base64,{base64.b64encode(webp_bytes).decode('utf-8')}"

        return {
            "success": True,
            "webp_base64": webp_b64,
            "saved_file": saved_file,
            "size_bytes": len(webp_bytes),
            "original_size": len(raw_bytes),
            "compression_ratio": f"{round((1 - len(webp_bytes)/len(raw_bytes)) * 100, 1)}%" if len(raw_bytes) > 0 else "0%"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
