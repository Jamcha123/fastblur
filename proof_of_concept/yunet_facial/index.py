import numpy as np 
import cv2 as cv
import os 

model_path = "face_detection_yunet_2023mar.onnx"
face_detector = cv.FaceDetectorYN.create(model_path, "", (320, 320))
face_detector.setScoreThreshold(0.9)   # confidence threshold
face_detector.setNMSThreshold(0.3)     # non-max suppression
face_detector.setInputSize((640, 480)) # you might need to change the input size to match your frame size

cam = cv.VideoCapture(1)
print(cam.isOpened())

index = 1
while True:
    ret, frame = cam.read()

    if not ret:
        break

    if index % 3 == 0: 
        facial_spotting = face_detector.detect(frame)[1]

        if facial_spotting is not None:
            for face in facial_spotting:
                x, y, w, h = face[:4].astype(int)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                
                roi = frame[y:y+h, x:x+w]
                roi = cv.GaussianBlur(roi, (103, 103), 30)
                frame[y:y+h, x:x+w] = roi

        cv.imshow("frame", frame)
        
        
        if cv.waitKey(1) == ord("q"):
            break
    
    index += 1