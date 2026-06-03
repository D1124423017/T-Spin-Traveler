#!/usr/bin/env python3
"""Normalize generated 4x4 sprite sheets into fixed game cells.

The script assumes the input is already an RGBA sheet with 4 columns and
4 rows. It keeps one shared scale for the whole sheet and aligns each frame by
the detected subject anchor, so playback does not drift because of per-frame
placement differences in generated art.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class BBox:
    left: int
    top: int
    right: int
    bottom: int

    @property
    def width(self) -> int:
        return self.right - self.left + 1

    @property
    def height(self) -> int:
        return self.bottom - self.top + 1

    @property
    def center_x(self) -> float:
        return (self.left + self.right) / 2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--rows", type=int, default=4)
    parser.add_argument("--cell-width", type=int, required=True)
    parser.add_argument("--cell-height", type=int, required=True)
    parser.add_argument("--anchor-mode", choices=("dark", "largest"), default="dark")
    parser.add_argument("--alpha-threshold", type=int, default=40)
    parser.add_argument("--max-upscale", type=float, default=1.12)
    parser.add_argument("--fill-x", type=float, default=0.94)
    parser.add_argument("--fill-y", type=float, default=0.94)
    parser.add_argument("--anchor-y", type=float, default=0.935)
    parser.add_argument("--dark-max-rgb", type=int, default=190)
    return parser.parse_args()


def alpha_bbox(image: Image.Image, alpha_threshold: int) -> BBox | None:
    pixels = image.load()
    xs: list[int] = []
    ys: list[int] = []
    for y in range(image.height):
        for x in range(image.width):
            if pixels[x, y][3] > alpha_threshold:
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return BBox(min(xs), min(ys), max(xs), max(ys))


def dark_bbox(image: Image.Image, alpha_threshold: int, dark_max_rgb: int) -> BBox | None:
    pixels = image.load()
    xs: list[int] = []
    ys: list[int] = []
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a > alpha_threshold and max(r, g, b) <= dark_max_rgb:
                xs.append(x)
                ys.append(y)
    if len(xs) < 80:
        return None
    return BBox(min(xs), min(ys), max(xs), max(ys))


def largest_component_bbox(image: Image.Image, alpha_threshold: int) -> BBox | None:
    pixels = image.load()
    width = image.width
    height = image.height
    visited = bytearray(width * height)
    best: tuple[int, BBox] | None = None

    def is_opaque(x: int, y: int) -> bool:
        return pixels[x, y][3] > alpha_threshold

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if visited[start_index] or not is_opaque(start_x, start_y):
                visited[start_index] = 1
                continue

            queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            visited[start_index] = 1
            area = 0
            left = right = start_x
            top = bottom = start_y

            while queue:
                x, y = queue.popleft()
                area += 1
                left = min(left, x)
                right = max(right, x)
                top = min(top, y)
                bottom = max(bottom, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    index = ny * width + nx
                    if visited[index]:
                        continue
                    visited[index] = 1
                    if is_opaque(nx, ny):
                        queue.append((nx, ny))

            bbox = BBox(left, top, right, bottom)
            if area < 80:
                continue
            if best is None or area > best[0]:
                best = (area, bbox)

    return best[1] if best else None


def anchor_bbox(image: Image.Image, args: argparse.Namespace) -> BBox | None:
    if args.anchor_mode == "dark":
        return (
            dark_bbox(image, args.alpha_threshold, args.dark_max_rgb)
            or largest_component_bbox(image, args.alpha_threshold)
            or alpha_bbox(image, args.alpha_threshold)
        )
    return (
        largest_component_bbox(image, args.alpha_threshold)
        or dark_bbox(image, args.alpha_threshold, args.dark_max_rgb)
        or alpha_bbox(image, args.alpha_threshold)
    )


def split_frames(image: Image.Image, columns: int, rows: int) -> list[Image.Image]:
    cell_width = image.width // columns
    cell_height = image.height // rows
    frames: list[Image.Image] = []
    for row in range(rows):
        for column in range(columns):
            frames.append(
                image.crop((
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                ))
            )
    return frames


def paste_with_alpha(base: Image.Image, sprite: Image.Image, x: int, y: int) -> None:
    base.alpha_composite(sprite, dest=(x, y))


def format_range(values: list[float]) -> str:
    if not values:
        return "n/a"
    return f"{min(values):.1f}-{max(values):.1f} delta {max(values) - min(values):.1f}"


def main() -> None:
    args = parse_args()
    source = Image.open(args.input).convert("RGBA")
    if source.width % args.columns != 0 or source.height % args.rows != 0:
        normalized_size = (
            args.columns * max(1, round(source.width / args.columns)),
            args.rows * max(1, round(source.height / args.rows)),
        )
        print(
            f"input_size={source.width}x{source.height} resized_for_grid="
            f"{normalized_size[0]}x{normalized_size[1]}"
        )
        source = source.resize(normalized_size, Image.Resampling.LANCZOS)

    frames = split_frames(source, args.columns, args.rows)
    content_boxes = [alpha_bbox(frame, args.alpha_threshold) for frame in frames]
    anchor_boxes = [anchor_bbox(frame, args) for frame in frames]
    if any(box is None for box in content_boxes):
        raise SystemExit("At least one frame has no alpha content")
    if any(box is None for box in anchor_boxes):
        raise SystemExit("At least one frame has no detectable anchor content")

    max_content_w = max(box.width for box in content_boxes if box)
    max_content_h = max(box.height for box in content_boxes if box)
    scale = min(
        (args.cell_width * args.fill_x) / max_content_w,
        (args.cell_height * args.fill_y) / max_content_h,
        args.max_upscale,
    )

    output = Image.new("RGBA", (args.cell_width * args.columns, args.cell_height * args.rows), (0, 0, 0, 0))
    target_anchor_x = args.cell_width / 2
    target_anchor_y = args.cell_height * args.anchor_y

    for index, frame in enumerate(frames):
        anchor = anchor_boxes[index]
        if anchor is None:
            continue
        scaled_size = (
            max(1, round(frame.width * scale)),
            max(1, round(frame.height * scale)),
        )
        scaled = frame.resize(scaled_size, Image.Resampling.LANCZOS)
        offset_x = round(target_anchor_x - anchor.center_x * scale)
        offset_y = round(target_anchor_y - anchor.bottom * scale)
        cell = Image.new("RGBA", (args.cell_width, args.cell_height), (0, 0, 0, 0))
        paste_with_alpha(cell, scaled, offset_x, offset_y)
        row = index // args.columns
        column = index % args.columns
        output.alpha_composite(cell, dest=(column * args.cell_width, row * args.cell_height))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output)

    output_frames = split_frames(output, args.columns, args.rows)
    anchors = [anchor_bbox(frame, args) for frame in output_frames]
    full_boxes = [alpha_bbox(frame, args.alpha_threshold) for frame in output_frames]
    center_values = [box.center_x for box in anchors if box]
    bottom_values = [float(box.bottom) for box in anchors if box]
    full_bottom_values = [float(box.bottom) for box in full_boxes if box]
    print(f"saved={args.output.as_posix()}")
    print(f"size={output.width}x{output.height} cell={args.cell_width}x{args.cell_height} scale={scale:.3f}")
    print(f"anchor_center={format_range(center_values)}")
    print(f"anchor_bottom={format_range(bottom_values)}")
    print(f"full_bottom={format_range(full_bottom_values)}")


if __name__ == "__main__":
    main()
