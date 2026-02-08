import cv2 as cv
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

#mediapipe is not finished yet

cam = cv.VideoCapture(1)
print(cam.isOpened())

ret, frame = cam.read()

cv.imwrite("image.jpg", frame)

image = mp.Image.create_from_file("image.jpg")

# Set up model options
base_options = python.BaseOptions(model_asset_path="face_detector.task")

options = vision.FaceDetectorOptions(
    base_options=base_options
)

# Create the detector instance
detector = vision.FaceDetector.create_from_options(options)

# Detect faces
result = detector.detect(image)
print(result)