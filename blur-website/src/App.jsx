import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import axios from 'axios'
import $ from 'jquery'
import {motion} from 'framer-motion'
import * as THREE from 'three'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {} from 'firebase/ai'
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
      <div className="fixed top-0 left-0 z-0 w-full h-full m-auto p-0 bg-black opacity-[0.85] flex flex-col align-middle justify-center text-center ">

      </div>
    </div>
  )
}

function AddNavbar(){
  const [active, setActive] = useState(false)  
  const [hover, setHover] = useState(false)  
  return(
    <nav className="relative z-99 w-full h-[8vh] m-auto p-0 bg-black flex flex-col align-middle justify-center text-center ">
      <ul className="relative flex flex-row align-middle justify-center text-center w-full h-[8vh] m-auto p-0 bg-transparent  ">
        <div className="relative w-full m-auto p-0 h-full bg-transparent flex flex-row align-middle justify-center text-center ">
          <motion.div onClick={() => setActive(true)} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className="relative w-[3em] cursor-pointer h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
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
          <motion.div onClick={() => setActive(false)} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className="relative w-[3em] cursor-pointer h-full m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? 25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-[15%] mb-[15%] p-0 bg-white "></motion.div>
            <motion.div initial={{translateX: 0 + "%"}} animate={{translateX: hover? -25 + "%" : 0 + "%"}} className="relative w-full h-[0.4rem] rounded-md m-auto mt-0 mb-0 p-0 bg-white "></motion.div>
          </motion.div>
        </div>
        <div className="relative w-full h-[92vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center  ">

        </div>
      </motion.ul>
    </nav>
  )
}

function AddMain(){
  useEffect(() => {
  })
  return(
    <div className="relative z-98 w-full h-fit m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <header className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
        <div className="relative w-full h-[25%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
          <h1 className="text-5xl text-white font-light">
            FastBlur - Hide Your Face <br />
            Upload A Image, Blur Every Face
          </h1>
        </div>
        <div className="relative w-full h-[50%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
          <div className="relative w-[75%] h-[75%] m-auto p-0 bg-slate-950 flex flex-col align-middle justify-center text-center ">

          </div>
        </div>
      </header>
      <section className="relative w-full h-[85vh] m-auto p-0 bg-transparent flex gap-5 flex-col align-middle justify-center text-center ">

      </section>
      <section className="relative w-full h-[75vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">

      </section>
      <footer className="relative w-full h-[50vh] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">

      </footer>
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