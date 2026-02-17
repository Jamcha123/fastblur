import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import axios from 'axios'
import $ from 'jquery'
import {motion} from 'framer-motion'
import * as THREE from 'three'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {} from 'firebase/ai'
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from 'firebase/app-check'
import image from './assets/image.svg'
import cam from './assets/cam.svg'
import yunet from './assets/yunet.jpg'
import haar from './assets/haar.jpg'
import github from './assets/github.svg'
import { getStorage, ref, uploadString } from 'firebase/storage'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import * as FaceAPI from 'face-api.js'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm")

const face_detector = await FaceDetector.createFromOptions(
  vision,
  {
    baseOptions: {
      modelAssetPath: "/blaze_face_short_range.tflite"
    }, 
    runningMode: "VIDEO"
  }
)


await FaceAPI.nets.ssdMobilenetv1.loadFromUri('/models');

const config = {
  apiKey: "AIzaSyBJCkmrGO_eZMh3x6-EQ8cQXHj7Omy7DTY",
  authDomain: "blurimage-eb134.firebaseapp.com",
  projectId: "blurimage-eb134",
  storageBucket: "blurimage-eb134.firebasestorage.app",
  messagingSenderId: "142908847898",
  appId: "1:142908847898:web:ebd945baf2e360a0045ea3",
  measurementId: "G-B5HLL4RFK4"
}

const app = initializeApp(config)

const appcheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LeUFG0sAAAAAFG4rYWD35cyNol8AwepepPhGSDn"), 
  isTokenAutoRefreshEnabled: true
})

const auth = getAuth(app)
auth.useDeviceLanguage()

const GetUser = new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if(user == null){
      signInAnonymously(auth).then((value) => {
        resolve(value.user.uid)
      })
    }else{
      resolve(user.uid)
    }
  })
})

const user = await GetUser

const db = getFirestore(app)

const storage = getStorage(app)

function AddBackground(){
  return(
    <div className="background fixed -z-1 top-0 left-0 w-full h-screen m-auto p-0 bg-linear-60 from-violet-950 via-pink-950 to-purple-950 ">
      <div className="fixed top-0 left-0 z-0 w-full h-full m-auto p-0 bg-black opacity-[0.75] flex flex-col align-middle justify-center text-center ">

      </div>
    </div>
  )
}

function AddNavbar(){
  const [active, setActive] = useState(false)  
  const [hover, setHover] = useState(false)  
  return(
    <nav className="fixed top-0 left-0 z-99 w-full h-[8vh] m-auto p-0 bg-black flex flex-col align-middle justify-center text-center ">
      <ul className="relative flex flex-row align-middle justify-center text-center w-full h-[8vh] m-auto p-0 bg-transparent  ">
        <div className="relative w-full m-auto p-0 h-full bg-transparent flex flex-row align-middle justify-center text-center ">
          <motion.div onClick={() => setActive(true)} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className="relative w-[3em] cursor-pointer h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center scale-[0.75] ">
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? 25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-[15%] mb-[15%] p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
          </motion.div>
          <div className="relative w-[75%] h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-evenly text-center ">
          </div>
        </div>
      </ul>
      <motion.ul initial={{translateX: -100 + "%"}} animate={{translateX: active? 0 + "%" : -100 + "%"}} transition={{type: "keyframes", duration: 1}} className="fixed left-0 top-0 flex flex-col align-middle justify-center text-center w-[30vh] h-screen m-auto p-0 bg-black  ">
        <div className="relative w-full h-[8vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center  ">
          <motion.div onClick={() => setActive(false)} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className="relative w-[3em] cursor-pointer h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center scale-[0.75] ">
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? 25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-[15%] mb-[15%] p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
          </motion.div>
        </div>
        <div className="relative w-full h-[72vh] m-auto p-0 bg-transparent flex flex-col align-middle  ">
          <div className="relative w-full h-[10vh] m-auto mt-[3%] mb-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <li className="text-2xl font-light text-white cursor-pointer underline underline-offset-2 "><a href="#header">Landing Page</a></li>
          </div>
          <div className="relative w-full h-[10vh] m-auto mt-[3%] mb-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <li className="text-2xl font-light text-white cursor-pointer underline underline-offset-2 "><a href="#cam">Facial Recognition</a></li>
          </div>
          <div className="relative w-full h-[10vh] m-auto mt-[3%] mb-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <li className="text-2xl font-light text-white cursor-pointer underline underline-offset-2 "><a href="#about">About Fastblur</a></li>
          </div>
        </div>
        <div className="relative w-full h-[20vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center  ">
        </div>
      </motion.ul>
    </nav>
  )
}

function AddMain(){
  const videoUploader = async () => {
    const video = document.createElement("video")
    video.style.transform = "translateY(50%)"

    const canvas = document.createElement("canvas")
    canvas.style.transform = "translateY(-50%)"
    
    const ctx = canvas.getContext("2d")

    $("#video").empty()
    async function record(){
      window.navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(async (value) => {
        video.srcObject = value
        video.muted = true
        await video.play()

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        requestAnimationFrame(detection)
      })
    }

    let startTime = null
    let [x, y, w, h] = [0, 0, 0, 0]
    async function detection(){
      if (!startTime) startTime = performance.now();
      const timestamp = performance.now() - startTime;
      const facial_detect = face_detector.detectForVideo(video, timestamp)

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      facial_detect.detections.forEach((e) => {
        const {originX, originY, width, height} = e.boundingBox
        
        ctx.filter = "blur(10px)"
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(originX-originX/2, originY-100, width+200, height+200)
      })

      requestAnimationFrame(detection)
    }
    document.getElementById("video").appendChild(video)
    document.getElementById("video").appendChild(canvas)

    record()
  }
  return(
    <div className="relative z-98 w-full h-fit m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <header id="header" className="relative w-full h-[90vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-[85%] overflow-hidden m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
          <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle ">
            <h1 className="text-4xl mt-[10%] font-medium text-white ">
              FastBlur
            </h1>
            <p className="text-xl mt-[2%] text-white font-light ">
              The Fast, Free, Effective Face Bluring App <br />
              Make Yourself GDPR Compliant <br /> 
              Protect Your Customers Facial Identity
            </p>
            <div className="relative w-[75%] h-[30%] lg:h-[20%] m-auto mt-[7%] p-0 bg-transparent gap-4 lg:gap-10 flex flex-col lg:flex-row align-middle justify-center text-center ">
              <motion.button onClick={() => window.location.href = "/#cam"} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-full lg:w-[15em] h-[35%] lg:h-[55%] m-auto p-0 border-white border rounded-xl bg-linear-60 from-blue-800 via-blue-900 to-blue-950 cursor-pointer text-white text-xl font-light flex flex-col align-middle justify-center text-center ">
                <a className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center " href="#cam">Get Started With The Camera</a>
              </motion.button>
              <motion.button onClick={() => window.location.href = "/#about"} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-full lg:w-[15em] h-[35%] lg:h-[55%] m-auto p-0 border-white border rounded-xl bg-linear-60 from-green-800 via-green-900 to-green-950 cursor-pointer text-white text-xl font-light flex flex-col align-middle justify-center text-center ">
                <a className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center " href="#about">About FastBlur</a>
              </motion.button>
              <motion.button onClick={() => window.location.href = ""} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-full lg:w-[22em] h-[35%] lg:h-[55%] m-auto p-0 rounded-xl bg-black border-white border cursor-pointer text-white text-xl font-light flex flex-row align-middle justify-center text-center ">
                <img src={github} style={{scale: 0.80}} alt="" />
                <a className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center" href="https://github.com/Jamcha123/fastblur">View FastBlur Github Repo</a>
              </motion.button>
            </div>
          </div>
        </div>
      </header>
      <section id="cam" className="relative w-full h-[110vh] m-auto p-0 bg-transparent flex gap-5 flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full h-[15%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h2 className="text-2xl text-white font-medium ">FastBlur Facial Recognition Example</h2>
          </div>
          <div id="video" onClick={videoUploader} className="relative cursor-pointer overflow-hidden w-[90%] h-[85%] m-auto p-0 bg-transparent border-white border-2 border-dashed flex flex-col align-middle justify-center text-center ">
            <img src={cam} style={{scale: 0.5}} className="relative w-full h-[50%] m-auto p-0 bg-transparent " alt="" />
            <div className="relative cursor-pointer w-full h-[50%] m-auto p-0 bg-transparent flex flex-col align-middle ">
              <h1 className="text-xl text-white font-medium ">
                Press Here To Use Your Web Camera For Real Time Bluring <br />
                I Do Everything Locally (No Storage On A Remote Server) <br />
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="relative w-[90%] h-[175vh] lg:h-screen m-auto p-0 bg-transparent flex flex-col lg:flex-row align-middle justify-center text-center ">
        <div className="relative w-full lg:w-[30%] h-[50vh] lg:h-[75vh] m-auto p-0 bg-linear-60 to-black via-lime-950 from-lime-900 flex flex-col align-middle ">
          <div className="relative w-full h-[20%] mt-0 mb-0 m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h2 className="text-2xl text-white font-medium ">
              About FastBlur
            </h2>
          </div>
          <div className="relative w-full h-[80%] m-auto p-0 bg-transparent flex flex-col align-middle ">
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent ">FastBlur Is Facial Bluring Software</li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent ">FastBlur Mainly Uses Googles Mediapipe Face Tracking</li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent ">FastBlur Stores Only On Your Local Device</li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent ">FastBlur Blurs Every Face In A Image Or Web Cam</li>
          </div>
        </div>
        <div className="relative w-full lg:w-[30%] h-[50vh] lg:h-[75vh] m-auto p-0 bg-linear-60 from-black via-blue-950 to-blue-900 flex flex-col align-middle ">
          <div className="relative w-full h-[20%] mt-0 mb-0 m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h2 className="text-2xl text-white font-semibold ">
              FastBlur Pricing
            </h2>
          </div>
          <div className="relative w-full h-[80%] m-auto p-0 bg-transparent flex flex-col align-middle ">
            <li className="text-xl font-medium text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent ">FastBlur Web Camera Web App = Free</li>
          </div>
        </div>
        <div className="relative w-full lg:w-[30%] h-[50vh] lg:h-[75vh] m-auto p-0 bg-linear-60 to-black via-orange-950 from-orange-900 flex flex-col align-middle ">
          <div className="relative w-full h-[20%] mt-0 mb-0 m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h2 className="text-2xl text-white font-medium ">
              FastBlur Models
            </h2>
          </div>
          <div className="relative w-full h-[80%] m-auto p-0 bg-transparent flex flex-col align-middle ">
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent underline underline-offset-2 "><a href="https://chuoling.github.io/mediapipe/">Google's Mediapipe Facial Tracking</a></li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent underline underline-offset-2 "><a href="https://docs.opencv.org/3.4/db/d28/tutorial_cascade_classifier.html">OpenCV Haar Like Features</a></li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent underline underline-offset-2 "><a href="https://github.com/geaxgx/depthai_yunet">OpenCV Yunet Facial Tracking</a></li>
            <li className="text-xl font-light text-gray-300 w-[75%] h-[10%] m-auto mt-0 mb-0 p-0 bg-transparent underline underline-offset-2 "><a href="https://github.com/todap/Face-Recognition-using-YoloV8-and-FaceNet">Yolo Facial Tracking</a></li>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function App(){
  return(
    <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <AddBackground></AddBackground>
      <AddNavbar></AddNavbar>
      <AddMain></AddMain>
    </div>
  )
}