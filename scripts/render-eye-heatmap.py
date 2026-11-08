"""Render an eight-second, seamless illustrative eye-tracking heatmap cover.

This is an art-directed animation, not a recording of measured participant gaze.
The original user-provided image is kept alongside the derived cover assets.
"""

from pathlib import Path
import math
import subprocess

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "src/media/eye-tracking"
SOURCE = MEDIA / "interior-reference.png"
OUTPUT = MEDIA / "attention-heatmap-loop.mp4"
POSTER = MEDIA / "attention-heatmap-poster.webp"

SIZE = 640
FPS = 24
SECONDS = 8
FRAMES = FPS * SECONDS

# Normalized gaze stations through the scene: framed art, figure, chair,
# plant, side table and window. Cubic easing gives small fixation pauses.
STATIONS = np.array(
    [
        [0.650, 0.385],
        [0.429, 0.455],
        [0.325, 0.680],
        [0.552, 0.618],
        [0.820, 0.515],
        [0.180, 0.310],
    ],
    dtype=np.float32,
)


def center_at(phase: float) -> np.ndarray:
    index = (phase % 1) * len(STATIONS)
    previous = int(index) % len(STATIONS)
    progress = index - math.floor(index)
    progress = progress * progress * (3 - 2 * progress)
    return STATIONS[previous] * (1 - progress) + STATIONS[(previous + 1) % len(STATIONS)] * progress


def prepare_source() -> np.ndarray:
    image = Image.open(SOURCE).convert("RGB")
    width, height = image.size
    crop = min(width, height)
    left = (width - crop) // 2
    top = (height - crop) // 2
    image = image.crop((left, top, left + crop, top + crop)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return np.asarray(image, dtype=np.float32)


def render_frame(phase: float, original: np.ndarray, gx: np.ndarray, gy: np.ndarray) -> Image.Image:
    position = center_at(phase)
    density = np.zeros((SIZE, SIZE), dtype=np.float32)

    # A warm, dominant fixation and decaying secondary stops make a readable
    # heatmap, while the trail makes movement apparent even at card scale.
    for lag, weight, radius in ((0.0, 0.97, 0.062), (0.035, 0.36, 0.074), (0.077, 0.18, 0.083)):
        cx, cy = center_at(phase - lag)
        dx = (gx - cx) / (radius * 1.12)
        dy = (gy - cy) / radius
        density += weight * np.exp(-0.5 * (dx * dx + dy * dy))

    # A quieter secondary fixation persists on the artwork while the gaze moves.
    dx = (gx - 0.65) / 0.077
    dy = (gy - 0.38) / 0.083
    density += (0.19 + 0.10 * math.sin(phase * math.tau) ** 2) * np.exp(-0.5 * (dx * dx + dy * dy))
    density = np.minimum(density, 1.25)
    # Blue → cyan → green → yellow → red, with a soft natural falloff.
    stops = (0.075, 0.19, 0.33, 0.54, 0.78, 1.10)
    colors = (
        (36, 77, 205),
        (32, 168, 235),
        (31, 217, 140),
        (218, 246, 63),
        (255, 177, 19),
        (255, 47, 28),
    )
    heat = np.stack(
        [np.interp(density, stops, [color[channel] for color in colors]) for channel in range(3)],
        axis=-1,
    ).astype(np.float32)
    alpha = np.minimum(0.74, np.maximum(0, (density - 0.08) * 0.84))[..., None]
    result = original * (1 - alpha) + heat * alpha
    image = Image.fromarray(np.uint8(np.clip(result, 0, 255)), mode="RGB")

    # Very small fixation cue: visible on full-size media, quiet at 300px.
    px, py = int(position[0] * SIZE), int(position[1] * SIZE)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((px - 7, py - 7, px + 7, py + 7), outline=(255, 255, 255, 110), width=1)
    draw.ellipse((px - 1, py - 1, px + 1, py + 1), fill=(255, 255, 255, 145))
    return image


def main() -> None:
    original = prepare_source()
    xx, yy = np.meshgrid(np.arange(SIZE, dtype=np.float32) / SIZE, np.arange(SIZE, dtype=np.float32) / SIZE)
    command = [
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{SIZE}x{SIZE}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
        "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUTPUT),
    ]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as ffmpeg:
        assert ffmpeg.stdin is not None
        for frame in range(FRAMES):
            image = render_frame(frame / FRAMES, original, xx, yy)
            if frame == FPS * 2:
                image.save(POSTER, "WEBP", quality=88, method=6)
            ffmpeg.stdin.write(image.tobytes())
        ffmpeg.stdin.close()
        if ffmpeg.wait() != 0:
            raise RuntimeError("ffmpeg could not encode the heatmap loop")
    print(f"Created {OUTPUT.name}: {SECONDS}s at {SIZE}x{SIZE}, {FPS} fps")


if __name__ == "__main__":
    main()
