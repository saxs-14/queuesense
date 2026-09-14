import numpy as np
from app.detection import count_people, estimate_wait_minutes


def test_count_people_zero_on_blank_frame():
    frame = np.zeros((300, 300, 3), dtype=np.uint8)
    assert count_people(frame) == 0


def test_estimate_wait_minutes_scales_with_count():
    assert estimate_wait_minutes(0) == 0.0
    assert estimate_wait_minutes(8) > estimate_wait_minutes(4)
