"use client"
import Certif from "./certif"
import Project from "./project"

export default function Portfolio() {
    return (
        <>
            <div className="w-[95%] sm:w-[65%] mx-auto mt-5 p-4">
                <div className="flex flex-col items-center gap-2">
                    <p className="font-[--font-ins-serif] text-4xl">Na Portofolio</p>
                    <p className="text-sm">March 22, 2025 - 05:46</p>
                    <p className="text-sm text-[grey]">We code. We design. We innovate.</p>
                </div>
                <Project></Project>
            </div>
            <div className="w-[95%] sm:w-[65%] mx-auto mt-5 p-4">
                <div className="flex flex-col items-center gap-2">
                    <p className="font-[--font-ins-serif] text-4xl">My Achievements</p>
                    <p className="text-sm">March 22, 2021 - Now</p>
                    <p className="text-sm text-[grey]">Certificate of My Journey</p>
                </div>
                <Certif></Certif>
            </div>
        </>
    )
}
