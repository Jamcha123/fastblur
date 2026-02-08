import cv2 as cv
import numpy as np
import os

faces = cv.CascadeClassifier()
faces.load("./public/haarcascade_frontalface_default.xml")

eyes = cv.CascadeClassifier()
eyes.load("./public/haarcascade_eye.xml")

def detection1(frame): 
    gray = cv.cvtColor(frame, cv.COLOR_BGR2BGRA)
    GetFaces = faces.detectMultiScale(gray, 1.3, 5)
    for (x1, y1, w1, h1) in GetFaces: 
        cv.rectangle(frame, (x1, y1), (x1+w1, y1+h1), (255, 255, 0, 0), 3)

        roi = frame[y1:y1+h1, x1:x1+w1]
        roi = cv.GaussianBlur(roi, (203, 203), 30)
        frame[y1:y1+h1, x1:x1+w1] = roi
    
    return frame

def detection2(frame): 
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    GetEyes = eyes.detectMultiScale(gray, 1.3, 5)
    for (x2, y2, w2, h2) in GetEyes:
        cv.rectangle(frame, (x2, y2), (x2+w2, y2+h2), (0, 0, 255, 255), 3)
        
        roi = frame[y2:y2+h2, x2:x2+w2]
        roi = cv.GaussianBlur(roi, (103, 103), 30)
        frame[y2:y2+h2, x2:x2+w2] = roi
    
    return frame
cam = cv.VideoCapture(1)
print(cam.isOpened())

index = 1
while True: 
    ret, frame = cam.read()
    
    if not ret: 
        break

    if index % 3 == 0: 
        detector = detection1(frame)
        cv.imshow("frame", detector)
        
        if cv.waitKey(1) == ord("q"):
            break
    index += 1

cam.release()
cv.destroyAllWindows()