"""
Anonymous people counting: OpenCV DNN + MobileNet-SSD, "person" class only.
No per-person tracking or identity is stored anywhere - each sample is just
a headcount snapshot, in line with "prefer anonymous counting" for a
public-space queue monitor.
"""
import os
from typing import List

import cv2
import numpy as np

from app.config import settings

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
PROTOTXT = os.path.join(MODEL_DIR, "MobileNetSSD_deploy.prototxt")
CAFFEMODEL = os.path.join(MODEL_DIR, "MobileNetSSD_deploy.caffemodel")

VOC_CLASSES = [
    "background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus",
    "car", "cat", "chair", "cow", "diningtable", "dog", "horse", "motorbike",
    "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor",
]

_net = None


def get_net():
    global _net
    if _net is None:
        if not (os.path.exists(PROTOTXT) and os.path.exists(CAFFEMODEL)):
            raise FileNotFoundError("MobileNet-SSD model files missing from backend/models/.")
        _net = cv2.dnn.readNetFromCaffe(PROTOTXT, CAFFEMODEL)
    return _net


def count_people(frame, confidence_threshold: float = 0.35) -> int:
    net = get_net()
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 0.007843, (300, 300), 127.5)
    net.setInput(blob)
    detections = net.forward()

    count = 0
    for i in range(detections.shape[2]):
        confidence = float(detections[0, 0, i, 2])
        if confidence < confidence_threshold:
            continue
        class_id = int(detections[0, 0, i, 1])
        if class_id < len(VOC_CLASSES) and VOC_CLASSES[class_id] == "person":
            count += 1
    return count


def estimate_wait_minutes(person_count: int) -> float:
    if settings.service_rate_per_minute <= 0:
        return 0.0
    return round(person_count / settings.service_rate_per_minute, 1)


def process_video(video_path: str, sample_every_seconds: float = 2.0) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    sample_every_n_frames = max(1, int(fps * sample_every_seconds))

    frame_no = 0
    samples: List[dict] = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_no += 1
        if frame_no % sample_every_n_frames != 0:
            continue

        count = count_people(frame)
        offset_seconds = round(frame_no / fps, 1)
        samples.append({
            "offset_seconds": offset_seconds,
            "person_count": count,
            "estimated_wait_minutes": estimate_wait_minutes(count),
        })

    cap.release()

    counts = [s["person_count"] for s in samples]
    return {
        "total_samples": len(samples),
        "avg_count": round(sum(counts) / len(counts), 1) if counts else 0.0,
        "peak_count": max(counts) if counts else 0,
        "samples": samples,
    }
