import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'
import {motion, useScroll} from 'framer-motion'
import $ from 'jquery'
import camera from './assets/cam.svg'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import {} from 'firebase/ai'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import {FaceDetector, FilesetResolver} from '@mediapipe/tasks-vision'

const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const detector = await FaceDetector.createFromOptions(
  vision, 
  {
    baseOptions: {
      modelAssetPath: "/model.tflite"
    }, 
    runningMode: "VIDEO"  
  }
)

const config = {
  apiKey: "",
  authDomain: "blurimage-eb134.firebaseapp.com",
  projectId: "blurimage-eb134",
  storageBucket: "blurimage-eb134.firebasestorage.app",
  messagingSenderId: "142908847898",
  appId: "1:142908847898:web:ebd945baf2e360a0045ea3",
  measurementId: "G-B5HLL4RFK4"
}

const app = initializeApp(config)

const auth = getAuth(app)
auth.useDeviceLanguage()

const user = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if(user == null){
      signInAnonymously(auth).then((value) => {
        resolve(value.user.uid)
      })
    }else{
      resolve(user.uid)
    }
  })
})

const appcheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("6LeUFG0sAAAAAFG4rYWD35cyNol8AwepepPhGSDn"), 
  isTokenAutoRefreshEnabled: true, 
})

const storage = getStorage(app)
const refs = ref(storage, "gs://blurimage-eb134.firebasestorage.app/haar_python.zip")

const link1 = await getDownloadURL(ref(storage, "gs://blurimage-eb134.firebasestorage.app/haar_python.zip"))
const link2 = await getDownloadURL(ref(storage, "gs://blurimage-eb134.firebasestorage.app/yunet_python.zip"))
const link3 = await getDownloadURL(ref(storage, "gs://blurimage-eb134.firebasestorage.app/mediapipe_python.zip"))

const db = getFirestore(app)

function AddThree({id}){
  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000)

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.set(0, 0, 30)

    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#" + id), 
      antialias: true, 
      depth: true
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)

    function AddStars(){
      const vertices = []
      for(let i = 0; i != 3000; i++){
        const x = THREE.MathUtils.randFloatSpread(2000)
        const y = THREE.MathUtils.randFloatSpread(2000)
        const z = THREE.MathUtils.randFloatSpread(2000)

        vertices.push(x, y, z)
      }

      const stargeometry = new THREE.BufferGeometry()
      stargeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))

      const starmaterial = new THREE.PointsMaterial({
        color: 0xffffff, 
        size: 2, 
        side: THREE.DoubleSide
      })

      const stars = new THREE.Points(stargeometry, starmaterial)
      stars.name = "stars"
      scene.add(stars)

      renderer.render(scene, camera)
    }
    AddStars()
    
    function resize(){
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.render(scene, camera)
    }

    function animate(){
      window.addEventListener("resize", resize)

      camera.rotation.z += 0.00005
      camera.rotation.x = document.body.getBoundingClientRect().top / 10000
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(animate)

  })
  return(
    <canvas id={id} className="relative w-full h-full m-0 p-0 bg-transparent z-2"></canvas>
  )
}

function AddBackground(){
  return(
    <div className="fixed -z-1 top-0 left-0 w-full h-full m-auto p-0 bg-linear-60 from-violet-900 via-pink-900 to-purple-900 flex flex-col align-middle justify-center text-center ">
      <div className="fixed z-0 top-0 left-0 w-full h-full m-auto p-0 bg-black opacity-[0.3] flex flex-col align-middle justify-center text-center ">

      </div>
      <div className="fixed z-1 top-0 left-0 w-full h-full m-auto p-0 flex flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-[400%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <motion.div className="relative w-[350vh] h-[500vh] translate-x-[0%] m-auto p-0 bg-black rotate-z-45 translate-y-[10%] md:translate-y-[20%] lg:translate-y-[30%] flex flex-col align-middle justify-center text-center">
            <AddThree id={"bg1"}></AddThree>
            <AddThree id={"bg2"}></AddThree>
            <AddThree id={"bg3"}></AddThree>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function AddMain(){
  const video = document.createElement("video")

  const canvas = document.createElement("canvas")
  canvas.setAttribute("id", "tracker")
  
  const webTrack = () => {
    $("#videos").empty()
    window.navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(async (value) => {
      video.srcObject = value
      video.muted = true
      await video.play()

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      document.getElementById("videos").appendChild(video)
      facial_detection()
    })

    const facial_detection = () => {
        const detection = detector.detectForVideo(video, performance.now())

        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if(detection.detections.length != 0){
          console.log(detection.detections)
          detection.detections.forEach((e) => {
            const {originX, originY, width, height} = e.boundingBox

            ctx.strokeStyle = "gray"
            ctx.lineWidth = 2
            ctx.fillStyle = "gray"
            ctx.filter = "blur(5px)"
            ctx.fillRect(originX-50, originY-150, width+100, height+200)
            ctx.strokeRect(originX-50, originY-150, width+100, height+200)
          })
          document.getElementById("videos").appendChild(canvas)
        }
        requestAnimationFrame(facial_detection)
    }
  }
  return(
    <div className="relative z-4 w-full h-fit m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <header className="relative w-full h-[90vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center">
        <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-start text-start  ">
          <div className="relative w-full h-[30%] mt-[15%] mb-0 m-auto ml-0 mr-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h1 className="text-3xl text-center md:text-start ml-0 md:ml-[5%] text-slate-200 mb-0 mt-0 ">Fastblur - Blur Your Face</h1>
            <p className="text-2xl text-center md:text-start ml-0 md:ml-[5%] text-white mb-0 mt-[2%] ">
              Fastblur - A effective and fast way to annoymize faces <br />
              Fastblur - Free to use but you can buy the python code 
            </p>
          </div>
          <div className="relative w-full h-[20em] md:h-[3em] mt-0 mb-0 m-auto ml-0 mr-0 p-0 bg-transparent flex flex-col md:flex-row align-middle md:justify-start justify-center md:text-start text-center ">
            <motion.button onClick={() => window.location.href = "#cam"} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-100 m-auto md:ml-[5%] md:mr-0 ml-auto mr-auto p-0 h-[5em] md:h-[3em] bg-lime-950 underline underline-offset-2 cursor-pointer flex flex-col align-middle justify-center text-center text-xl text-white font-light " >
              <a className="w-full h-full flex flex-col align-middle justify-center text-center relative m-auto p-0 " href="#cam">Fastblur Camera</a>
            </motion.button>
            <motion.button onClick={() => window.location.href = "https://github.com/Jamcha123/fastblur"} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-100 m-auto md:ml-[5%] mt-[10%] md:mt-0 md:mr-0 ml-auto mr-auto p-0 h-[5em] md:h-[3em] underline underline-offset-2 cursor-pointer bg-lime-900 flex flex-col align-middle justify-center text-center text-xl text-white font-light " >
              <a className="w-full h-full flex flex-col align-middle justify-center text-center relative m-auto p-0 " href="https://github.com/Jamcha123/fastblur">Fastblur Github Repo</a>
            </motion.button>
            <motion.button onClick={() => window.location.href = "#models"} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-100 m-auto md:ml-[5%] mt-[10%] md:mt-0 md:mr-0 ml-auto mr-auto p-0 h-[5em] md:h-[3em] underline underline-offset-2 cursor-pointer bg-lime-800 flex flex-col align-middle justify-center text-center text-xl text-white font-light " >
              <a className="w-full h-full flex flex-col align-middle justify-center text-center relative m-auto p-0 " href="#models">Buy the Fastblur Python Software</a>
            </motion.button>
          </div>
        </div>
      </header>
      <section id="about" className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex flex-col align-middle ">
        <div className="relative w-[75%] h-[75%] m-auto mt-0 mb-0 p-0 bg-linear-60 from-slate-950 via-slate-900 to-slate-800 rounded-2xl flex flex-col align-middle ">
          <h1 className="text-center md:text-start md:ml-[5%] ml-0 text-3xl text-white font-medium mt-[10%] mb-0 ">
            About Fastblur
          </h1>
          <p className="text-center md:text-start md:ml-[5%] ml-0 text-2xl text-gray-200 font-light mt-[5%] mb-0 ">
            Fastblur is software for face bluring using computer vision and face tracking. <br /><br />
            Fastblur has two options: Image uploading and/or use your webcam. <br /><br />
            Fastblur gives you access to 3 models: haar like features, yunet or mediapipe (all of them based on opencv)
          </p>
          <ul className="relative w-full h-fit m-auto mt-[5%] mb-0 hidden flex-col align-middle justify-center text-center ">
            <li className="text-2xl text-white font-medium ml-[5%] text-start">Fastblur offers software code to buy and to download to get the python file</li>
            <li className="text-xl text-gray-200 font-medium ml-[5%] mt-[3%] text-start">Fastblur Haar-like Features code price: $0.50 per python code</li>
            <li className="text-xl text-gray-200 font-medium ml-[5%] mt-[3%] text-start">Fastblur Yunet code price: $1.00 per python code</li>
            <li className="text-xl text-gray-200 font-medium ml-[5%] mt-[3%] text-start">Fastblur Mediapipe code price: $1.50 per python code</li>
          </ul>
        </div>
      </section>
      <section id="cam" className="relative w-full h-[125vh] overflow-hidden m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
        <div onClick={webTrack} id="videos" className="relative w-[75%] h-[80%] m-auto p-0 bg-transparent border-white border-2 border-dashed flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full h-[40%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center">
            <img className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center " src={camera} style={{scale: 0.75, margin: 0}} alt="" />
          </div>
          <div className="relative w-full h-[60%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center">
            <h1 className="text-3xl text-white font-medium m-0">Press to blur your face using your web cam</h1>
            <p className="text-3xl text-white font-light">This is just an example of the software <br /> <br /> I do <strong>NOT</strong> store any data, its all local</p>
          </div>
        </div>
      </section>
      <section id="models" className="relative w-full h-[150vh] m-auto p-0 bg-transparent flex flex-col gap-20 align-middle justify-center text-center ">
        <div className="relative w-[75%] h-[50vh] m-auto p-0 bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
            <h1 className="text-2xl text-white font-medium flex flex-col align-middle justify-center text-center ">
              Fastblur Haar Like Features Python Code
            </h1>
          </div>
          <div className="relative w-full h-[60%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center "></div>          
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle md:justify-end justify-center md:text-end text-center">
            <div className="relative w-[75%] md:w-[35%] h-full m-auto ml-0 mr-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
              <motion.button initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-[75%] h-[3em] cursor-pointer underline underline-offset-2 m-auto p-0 border-2 border-orange-800 bg-black text-white text-xl font-light ">
                Buy Software
              </motion.button>
            </div>
          </div>         
        </div>
        <div className="relative w-[75%] h-[50vh] m-auto p-0 bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
            <h1 className="text-2xl text-white font-medium flex flex-col align-middle justify-center text-center ">
              Fastblur Yunet Python Code
            </h1>
          </div>
          <div className="relative w-full h-[60%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center "></div>          
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center md:justify-end md:text-end ">
            <div className="relative w-[75%] md:w-[35%] h-full m-auto ml-0 mr-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
              <motion.button initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-[75%] h-[3em] cursor-pointer underline underline-offset-2 m-auto p-0 border-2 border-orange-800 bg-black text-white text-xl font-light ">
                Buy Software
              </motion.button>
            </div>
          </div>         
        </div>
        <div className="relative w-[75%] h-[50vh] m-auto p-0 bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
            <h1 className="text-2xl text-white font-medium flex flex-col align-middle justify-center text-center ">
              Fastblur Mediapipe Python Code
            </h1>
          </div>
          <div className="relative w-full h-[60%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center "></div>          
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center md:justify-end md:text-end ">
            <div className="relative w-[75%] md:w-[35%] h-full m-auto ml-0 mr-0 p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
              <motion.button initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-[75%] h-[3em] cursor-pointer underline underline-offset-2 m-auto p-0 border-2 border-orange-800 bg-black text-white text-xl font-light ">
                Buy Software
              </motion.button>
            </div>
          </div>         
        </div>
      </section>
    </div>
  )
}

export default function App(){
  return(
    <div className="relative w-full h-fit m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <AddBackground></AddBackground>
      <AddMain></AddMain>
    </div>
  )
}