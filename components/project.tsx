"use clint"

import Image from "next/image"
import { useState } from "react"

export default function Project() {

    const [display, setDisplay] = useState<string>("all")

    return (
        <>
            <div className="mt-4 hidden sm:flex p-4 justify-center gap-6">
                <div onClick={() => setDisplay("all")} className={`link border ${display == "all" ? "border-pink-500" : "border-white"} rounded-md w-fit h-fit py-2 px-4 cursor-pointer`}>All</div>
                <div onClick={() => setDisplay("development")} className={`link border ${display == "development" ? "border-pink-500" : "border-white"} rounded-md w-fit h-fit py-2 px-4 cursor-pointer`}>Development</div>
                <div onClick={() => setDisplay("design")} className={`link border ${display == "design" ? "border-pink-500" : "border-white"} rounded-md w-fit h-fit py-2 px-4 cursor-pointer`}>Design</div>
            </div>
            <div className="w-full flex flex-col sm:flex-row flex-wrap justify-evenly gap-4 mx-auto p-4 mt-5">

                {(display === "development" || display === "all") && (
                    <div className="w-full sm:w-[45%] h-fit p-4">
                        <div id="img" className="w-full h-35 relative">
                            <Image src={"/portfolio/photoboth.png"} fill alt="foto"></Image>
                        </div>
                        <p className="mt-3 font-semibold">Photoboth Web</p>
                        <p className="text-sm">2025</p>
                        <p className="mt-3 text-sm text-[grey]">
                            Take photos and combine them into one to keep your memories, built with nextjs.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <div className="border w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-white text-black">Nextjs</div>
                            <div className="border w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-white text-black">Tailwind</div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <a target="_blank" href="https://photooo.vercel.app">
                                <div className="link border border-pink-500 w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-black">View</div>
                            </a>
                            <a target="_blank" href="https://github.com/RadyaI/photoboth">
                                <div className="link border border-pink-500 w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-black">Github</div>
                            </a>
                        </div>
                    </div>
                )}


                {(display === "design" || display === "all") && (<div className="w-full sm:w-[45%] h-fit p-4">
                    <div id="img" className="w-full h-55 relative">
                        <Image src={"/portfolio/kepitingtakpunyasayap.jpeg"} fill alt="foto"></Image>
                    </div>
                    <p className="mt-3 font-semibold">Storyboard</p>
                    <p className="text-sm">2023</p>
                    <p className="mt-3 text-sm text-[grey]">Kepiting yang tak punya sayap.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <div className="border w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-white text-black">Clip Studio Paint</div>
                        <div className="border w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-white text-black">Ibis Paint X</div>
                        <div className="border w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-white text-black">Design</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <a target="_blank" href="https://www.linkedin.com/feed/update/urn:li:activity:7227874776185249793/"><div className="link border border-pink-500 w-fit h-fit text-sm p-1 px-2 rounded-md font-semibold bg-black">View</div></a>
                    </div>
                </div>)}

                

            </div>
        </>
    )
}