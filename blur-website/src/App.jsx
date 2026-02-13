import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import axios from 'axios'
import $ from 'jquery'
import {motion} from 'framer-motion'
import * as THREE from 'three'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {} from 'firebase/ai'
import image from './assets/image.svg'
import yunet from './assets/yunet.jpg'
import haar from './assets/haar.jpg'
import { getStorage, ref, uploadString } from 'firebase/storage'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

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
            <h1 className="text-2xl text-white font-bold">
              FastBlur
            </h1>
          </div>
        </div>
      </ul>
      <motion.ul initial={{translateX: -100 + "%"}} animate={{translateX: active? 0 + "%" : -100 + "%"}} transition={{type: "keyframes", duration: 1}} className="fixed left-0 top-0 flex flex-col align-middle justify-center text-center w-[20vh] h-screen m-auto p-0 bg-black  ">
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
            <li className="text-2xl font-light text-white cursor-pointer underline underline-offset-2 "><a href="#main">Image Uploader</a></li>
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
  const imageUploader = async () => {
    const create_files = document.createElement("input")
    create_files.type = "file"
    create_files.click()

    const items = new Promise((resolve) => {
      create_files.addEventListener("change", (e) => {
        resolve(create_files.files[0])
      })
    })

    const reader = new FileReader()
    const file_reading = new Promise(async (resolve) => {
      reader.onload = (e) => {
        const results = e.target.result
        resolve(results)
      }
      reader.readAsDataURL(await items)
    })
    
    const data = ((await file_reading))
    $("#image").empty()

    const image = document.createElement("img")
    image.classList.add("images")
    image.src = data

    document.getElementById("image").appendChild(image)
  }
  useEffect(() => {
  })
  return(
    <div className="relative z-98 w-full h-fit m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <header id="header" className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-[25%] mt-[5%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <h1 className="text-5xl text-white font-medium flex flex-col align-middle justify-center text-center">
            <p className="flex flex-row align-middle justify-center text-center">FastBlur <strong className="hidden md:block ml-[2%] "> - Hide Your Face</strong></p>
          </h1>
        </div>
        <div className="relative w-full h-[55%] overflow-hidden m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <div className="relative w-full overflow-hidden h-full m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
            <div className="relative w-[75%] h-full m-auto p-0 bg-transparent overflow-hidden flex flex-row align-middle justify-center text-center gap-5 ">
              <motion.div initial={{translateX: 150 + "%"}} animate={{translateX: -150 + "%"}} transition={{type: "keyframes", duration: 35, repeatType: "reverse", ease: "easeInOut", repeat: Infinity}} className="relative w-[75vh] min-w-[75vh] max-w-[75vh] h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                <img className="relative w-full h-[90%] m-auto p-0 bg-transparent rounded-xl " src={haar} alt="" />
                <div className="relative w-full h-[10%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                  <h1 className="text-2xl text-white font-light ">
                    Haar Like Facial bluring
                  </h1>
                </div>
              </motion.div>
              <motion.div initial={{translateX: 150 + "%"}} animate={{translateX: -150 + "%"}} transition={{type: "keyframes", duration: 35, repeatType: "reverse", ease: "easeInOut", repeat: Infinity}} className="relative w-[75vh] min-w-[75vh] max-w-[75vh] h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                <img className="relative w-full h-[90%] m-auto p-0 bg-transparent rounded-xl " src={yunet} alt="" />
                <div className="relative w-full h-[10%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                  <h1 className="text-2xl text-white font-light ">
                    Yunet Facial bluring
                  </h1>
                </div>
              </motion.div>
              <motion.div initial={{translateX: 150 + "%"}} animate={{translateX: -150 + "%"}} transition={{type: "keyframes", duration: 35, repeatType: "reverse", ease: "easeInOut", repeat: Infinity}} className="relative w-[75vh] min-w-[75vh] max-w-[75vh] h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                <img className="relative w-full h-[90%] m-auto p-0 bg-transparent rounded-xl " src="" alt="" />
                <div className="relative w-full h-[10%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                  <h1 className="text-2xl text-white font-light ">
                    Yolo Facial bluring
                  </h1>
                </div>
              </motion.div>
              <motion.div initial={{translateX: 150 + "%"}} animate={{translateX: -150 + "%"}} transition={{type: "keyframes", duration: 35, repeatType: "reverse", ease: "easeInOut", repeat: Infinity}} className="relative w-[75vh] min-w-[75vh] max-w-[75vh] h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                <img className="relative w-full h-[90%] m-auto p-0 bg-transparent rounded-xl " src="" alt="" />
                <div className="relative w-full h-[10%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
                  <h1 className="text-xl text-white font-light ">
                    Mediapipe Facial bluring
                  </h1>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="relative w-full h-[20%] overflow-hidden m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <motion.button initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} onClick={() => {window.location.href = "#main"}} className="relative w-[10em] h-[3em] m-auto p-0 cursor-pointer bg-slate-950 border-lime-600 border-2 rounded-md text-xl text-white font-light ">
            To The Main App
          </motion.button>
        </div>
      </header>
      <section id="main" className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex gap-5 flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <div id="image" onClick={imageUploader} className="relative cursor-pointer w-[75%] h-[75%] m-auto p-0 bg-transparent border-white border-2 border-dashed flex flex-col align-middle justify-center text-center ">
            <img src={image} style={{scale: 0.5}} className="relative w-full h-[50%] m-auto p-0 bg-transparent " alt="" />
            <div className="relative cursor-pointer w-full h-[50%] m-auto p-0 bg-transparent flex flex-col align-middle ">
              <h1 className="text-xl text-white font-medium ">
                Upload Your Images Here <br />
                Only .png, .jpeg and .jpg image files <br />
                Press Here To Upload A Image <br />
                I Do Everything Locally (No Storage On A Remote Server) <br />
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section id="cam" className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex gap-5 flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <div id="video" onClick={imageUploader} className="relative cursor-pointer w-[75%] h-[75%] m-auto p-0 bg-transparent border-white border-2 border-dashed flex flex-col align-middle justify-center text-center ">
            <img src={image} style={{scale: 0.5}} className="relative w-full h-[50%] m-auto p-0 bg-transparent " alt="" />
            <div className="relative cursor-pointer w-full h-[50%] m-auto p-0 bg-transparent flex flex-col align-middle ">
              <h1 className="text-xl text-white font-medium ">
                Press Here To Use Your Web Camera For Real Time Bluring <br />
                I Do Everything Locally (No Storage On A Remote Server) <br />
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="relative w-[75%] h-[200vh] min-h-[200vh] max-h-[200vh] md:h-screen md:min-h-screen md:max-h-screen  m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center md:grid md:grid-cols-2 md:grid-row-2 gap-10 ">
        <div className="relative w-full min-h-[50vh] h-[50vh] max-h-[50vh] mt-0 md:mt-auto m-auto p-0 border-2 border-white rounded-xl bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle ">
          <h1 className="text-2xl text-white font-medium mt-[5%] ">
            Fast and Effective
          </h1>
        </div>
        <div className="relative w-full min-h-[50vh] h-[50vh] max-h-[50vh] mt-0 md:mt-auto m-auto p-0 border-2 border-white rounded-xl bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle ">
          <h1 className="text-2xl text-white font-medium mt-[5%] ">
            What FastBlur Offers
          </h1>
        </div>
        <div className="relative w-full min-h-[50vh] h-[50vh] max-h-[50vh] mt-0 md:mt-auto m-auto p-0 border-2 border-white rounded-xl bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle ">
          <h1 className="text-2xl text-white font-medium mt-[5%] ">
            Model Types 
          </h1>
        </div>
        <div className="relative w-full min-h-[50vh] h-[50vh] max-h-[50vh] mt-0 md:mt-auto m-auto p-0 border-2 border-white rounded-xl bg-linear-60 from-slate-950 via-slate-900 to-slate-800 flex flex-col align-middle ">
          <h1 className="text-2xl text-white font-medium mt-[5%] ">
            Cost Efficient
          </h1>
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