"use client"
import AnimatedCursor from "react-animated-cursor";

export default function Cursor() {
    return (
        <>
            <AnimatedCursor
                innerSize={8}
                outerSize={55}
                color='0, 150, 255'
                outerAlpha={0.5}
                innerScale={0.7}
                outerScale={2}
                showSystemCursor={false}
                clickables={[
                    'a',
                    'input[type="text"]',
                    'input[type="email"]',
                    'input[type="number"]',
                    'input[type="submit"]',
                    'input[type="image"]',
                    'label[for]',
                    'select',
                    'textarea',
                    'button',
                    '.link',
                    'span'
                ]}
                outerStyle={{
                    border: '2px solid pink',
                    backgroundColor: 'rgba(255, 192, 203, 0.5)',
                    filter: 'blur(5px)'
                }}
                innerStyle={{
                    backgroundColor: 'transparent',
                    border: '2px solid pink'
                }}
            />
        </>
    )
}
