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
  apiKey: "<api-key>",
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

export default function App(){
  const AddImage = async () => {
    let data_limit = (await getDoc(doc(db, user + "/data_limit"))).get("data")
    let data_current = (await getDoc(doc(db, user + "/data_current"))).get("data")

    if(data_current >= data_limit){
      alert("Cannot upload anymore images\nDelete some or Buy more data for $1 per GB")
      return
    }

    let file_uploader = document.createElement("input")
    file_uploader.type = "file"
    file_uploader.click()

    const file_change = new Promise((resolve) => {
      file_uploader.addEventListener("change", (e) => {e.preventDefault(); resolve(file_uploader.files[0])})
    })
    
    const file_name = (await file_change)["name"]
    if(file_name.split(".")[1] != "png" && file_name.split(".")[1] != "jpeg" && file_name.split(".")[1] != "jpg"){
      alert(file_name + " is not a png, jpeg or jpg file\nUpload a png, jpeg or jpg image file")
      return
    }

    const reader = new FileReader()

    const file_data = new Promise(async (resolve) => {
      reader.onload = (e) => {
        const results = e.target.result
        resolve(results)
      }
      reader.readAsDataURL(new Blob([(await file_change)]))
    })
    const base64_image = (await file_data).split(",")
    
    const storageRef = ref(storage, user + "/" + file_name.split(".")[0] + ".png")

    const stringUpload = uploadString(storageRef, base64_image[1], "base64")
    stringUpload.then((value) => {
      console.log(base64_image)
    })

    const file_container = document.createElement("div")
    file_container.classList.add("file_container")
    document.getElementById("files").appendChild(file_container)
    
    const file_title = document.createElement("div")
    file_title.classList.add("file_titles")
    file_container.appendChild(file_title)

    const file_dates = document.createElement("div")
    file_dates.classList.add("file_dates")
    file_container.appendChild(file_dates)

    const file_preview = document.createElement("div")
    file_preview.classList.add("file_preview")
    file_container.appendChild(file_preview)
    

    const file_deletion = document.createElement("div")
    file_deletion.classList.add("file_deletion")
    file_container.appendChild(file_deletion)

    let data = data_limit * Math.pow(10, 9)

    const size_to_limit = ((await file_change)["size"] / data)
    
    let data_numbers = data_current + size_to_limit
    setDoc(doc(db, user + "/data_current"), {"data": data_numbers})

    document.getElementById("data-bar").value = data_numbers
    document.getElementById("data-bar").max = data_limit

    document.getElementById("data-numbers").innerText = data_numbers + " GB / " + data_limit + " GB"
  }
  useEffect(() => {
    (async () => {
      let data_limit = (await getDoc(doc(db, user + "/data_limit"))).get("data")
      if(data_limit == null || data_limit == undefined){
        setDoc(doc(db, user + "/data_limit"), {"data": 2})
      }
      data_limit = (await getDoc(doc(db, user + "/data_limit"))).get("data")

      let data_current = (await getDoc(doc(db, user + "/data_current"))).get("data")
      if(data_current == undefined || data_current == null)[
        setDoc(doc(db, user + "/data_current"), {"data": 0})
      ]
      data_current = (await getDoc(doc(db, user + "/data_current"))).get("data")

      document.getElementById("data-bar").value = data_current
      document.getElementById("data-bar").max = data_limit

      document.getElementById("data-numbers").innerText = data_current + " GB / " + data_limit + " GB"

    })()
  })
  return(
    <div className="fixed top-0 left-0 w-full h-screen m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
      <section className="relative w-[75%] h-[30%] m-auto p-0 bg-transparent flex flex-row align-middle justify-center text-center ">
        <div className="relative w-[65%] h-[95%] m-auto p-0 bg-linear-60 from-slate-100 via-slate-200 to-slate-300 shadow-xl shadow-black flex flex-col align-middle text-start rounded-2xl ">
          <div className="relative w-full h-[20%] m-auto p-0 bg-transparent flex flex-col align-middle justify-center text-center ">
            <h1 className="font-medium text-xl text-black">Static Images Bluring</h1>
          </div>
          <div className="relative w-full h-[80%] m-auto p-0 bg-transparent flex flex-col align-top justify-start text-center">

          </div>
        </div>
        <div className="relative w-[45%] h-[95%] m-auto p-0 bg-slate-100 shadow-xl shadow-black hidden flex-col align-middle text-start rounded-2xl ">
          <h1>Static Images</h1>
        </div>
      </section>
      <section id="files" className="relative w-[75%] h-[55%] mt-[5%] m-auto p-0 bg-transparent flex flex-col align-middle overflow-x-hidden overflow-y-auto ">
        <div className="relative w-full h-[10%] m-auto p-0 mt-0 mb-0 bg-transparent flex flex-row align-middle justify-center text-center ">
          <div className="relative w-[50%] md:w-[30%] lg:w-[25%] xl:w-[20%] m-auto p-0 h-full bg-transparent flex flex-col align-middle justify-center text-center ">
            <h2 className="text-xl text-black font-light " >File Name</h2>
          </div>
          <div className="relative w-[50%] md:w-[30%] lg:w-[25%] xl:w-[20%] m-auto p-0 h-full bg-transparent hidden md:flex flex-col align-middle justify-center text-center ">
            <h2 className="text-xl text-black font-light " >Last Uploaded</h2>
          </div>
          <div className="relative w-[50%] md:w-[30%] lg:w-[25%] xl:w-[20%] m-auto p-0 h-full bg-transparent hidden lg:flex flex-col align-middle justify-center text-center ">
            <h2 className="text-xl text-black font-light " >Previews</h2>
          </div>
          <div className="relative w-[50%] md:w-[30%] lg:w-[25%] xl:w-[20%] m-auto p-0 h-full bg-transparent hidden xl:flex flex-col align-middle justify-center text-center ">
            <h2 className="text-xl text-black font-light " >Deletion</h2>
          </div>
          <div className="relative w-[50%] md:w-[30%] lg:w-[25%] xl:w-[20%] m-auto p-0 h-full bg-transparent flex flex-col align-middle justify-center text-center ">
            <motion.button type="button" onClick={AddImage} initial={{scale: 1}} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} transition={{type: "spring", duration: 1}} className="relative w-[95%] h-[75%] m-auto p-0 bg-slate-700 flex flex-col align-middle justify-center text-center font-light text-xl text-white rounded-xl cursor-pointer ">
              + Upload Image
            </motion.button>
          </div>
        </div>
      </section>
      <section className="relative w-[75%] h-[15%] m-auto p-0 bg-transparent flex flex-col align-middle text-center justify-center gap-3 ">
        <div className="relative w-full h-[50%] m-auto p-0 rounded-md flex flex-col align-middle justify-center text-center ">
        </div>
        <div className="relative w-full h-[25%] m-auto p-0 rounded-md flex flex-col align-middle justify-center text-center ">
          <p id="data-numbers" className="text-black text-center font-light text-xl ">
            0 GB / 2 GB
          </p>
        </div>
        <div className="relative w-full h-[25%] m-auto p-0 rounded-md flex flex-col align-middle justify-center text-center">
          <progress id="data-bar" value="0" max="5" className="relative w-full h-[0.5em] m-auto p-0 rounded-md bg-transparent  "></progress>
        </div>
      </section>
    </div>
  )
}