"use clint"

import Image from "next/image"

export default function Certif() {
    return (
        <>
            <div className="w-full flex flex-col sm:flex-row flex-wrap justify-evenly gap-4 mx-auto p-4 mt-5">

                <div className="w-full sm:w-[45%] h-fit p-4">
                    <div id="img" className="w-full h-50 relative">
                        <a target="_blank" href="https://www.linkedin.com/feed/update/urn:li:activity:7293860190796292096/">
                            <Image src={"/certif/java.jpeg"} fill alt="foto"></Image>
                        </a>
                    </div>
                    <p className="mt-3 font-semibold">Java Programming</p>
                    <p className="text-sm">2025</p>
                    <p className="mt-3 text-sm text-[grey]">
                        Completed the "Getting Started with Java Programming" course at Dicoding Academy.
                    </p>
                </div>

                <div className="w-full sm:w-[45%] h-fit p-4">
                    <div id="img" className="w-full h-50 relative">
                        <a target="_blank" href="https://www.linkedin.com/feed/update/urn:li:activity:7276594414230102016/">
                            <Image src={"/certif/workshop.jpeg"} fill alt="foto"></Image>
                        </a>
                    </div>
                    <p className="mt-3 font-semibold">Empower Your Mobile Apps with Flutter and RESTful APIs</p>
                    <p className="text-sm">2024</p>
                    <p className="mt-3 text-sm text-[grey]">
                        Unforgettable Moment as an MC at the Devcom Workshop!
                    </p>
                </div>

                <div className="w-full sm:w-[45%] h-fit p-4">
                    <div id="img" className="w-full h-50 relative">
                        <a target="_blank" href="https://www.linkedin.com/feed/update/urn:li:activity:7226507044164354048/">
                            <Image src={"/certif/timproduksi.jpeg"} fill alt="foto"></Image>
                        </a>
                    </div>
                    <p className="mt-3 font-semibold">Animated film production team Ministry of Education and Culture.</p>
                    <p className="text-sm">2022</p>
                    <p className="mt-3 text-sm text-[grey]"></p>
                </div>

            </div>
        </>
    )
}