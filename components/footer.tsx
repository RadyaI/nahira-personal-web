import Letter from "./letter"

export default function Footer() {
    return (
        <>
            <div className="w-[95%] sm:w-1/2 mx-auto mb-25 sm:mb-50 p-4">
                <p className="text-center text-2xl sm:text-4xl font-semibold">Get In Touch</p>
                <p className="text-center text-sm text-[grey]">Have a <span className="text-white underline">project</span>, an <span className="text-white underline">idea</span>, or just want to <span className="text-white underline">say hi?</span> Feel free to reach out—I'd love to hear from you and see how we can <span className="text-white underline">work together</span>!</p>
                <div className="sm:block hidden mt-20 w-fit mx-auto">
                    <Letter></Letter>
                </div>
                <div className="sm:hidden block mt-10 w-fit mx-auto">
                    <a href="mailto:nahira080506@gmail.com"><button className="border py-3 px-7 rounded-md">Email</button></a>
                </div>
            </div>
        </>
    )
}
