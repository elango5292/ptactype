'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

const loremIpsum = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.`

export default function VercelInspiredTypingPractice() {
  const [texts, setTexts] = useState([loremIpsum])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)

  const fetchQuote = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en')
      const data = await response.json()
      console.log('data', data)
      setTexts((prevTexts) => [...prevTexts, data.text])
    } catch (error) {
      console.error('Failed to fetch quote:', error)
      setTexts((prevTexts) => [...prevTexts, 'Error fetching quote. Please try again.'])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [texts])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setInput(inputValue)

    if (!startTime) {
      setStartTime(Date.now())
    }

    // Calculate WPM
    const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000
    const wordsTyped = inputValue.trim().split(/\s+/).length
    const currentWpm = Math.round(wordsTyped / timeElapsed)
    setWpm(currentWpm || 0)

    // Calculate accuracy
    const fullText = texts.join(' ')
    const correctChars = inputValue.split('').filter((char, index) => char === fullText[index]).length
    const currentAccuracy = Math.round((correctChars / inputValue.length) * 100)
    setAccuracy(currentAccuracy || 100)

    // Scroll text
    if (textContainerRef.current) {
      const containerWidth = textContainerRef.current.offsetWidth
      const textWidth = textContainerRef.current.scrollWidth
      const scrollPosition = Math.max(0, (inputValue.length / fullText.length) * textWidth - containerWidth / 2)
      textContainerRef.current.scrollLeft = scrollPosition
    }

    // Check if the user has typed half of the current text and fetch new text if needed
    if (inputValue.length >= fullText.length / 2 && texts.length === 1) {
      fetchQuote()
    }

    // Check if the user has completed the current text
    if (inputValue === fullText) {
      fetchQuote()
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#888888] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-[#111111] border border-[#333333] rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 tracking-tighter text-[#fafafa]">Typing Practice</h1>
        <div className="relative mb-6 h-12 overflow-hidden rounded-md bg-[#1a1a1a]"> {/* Height changed here */}
          <div 
            ref={textContainerRef}
            className="absolute top-0 left-0 w-full h-full flex items-center overflow-x-hidden"
          >
            <div className="text-lg leading-relaxed font-mono whitespace-nowrap px-4"> {/* Text size changed here */}
              {texts.join(' ').split('').map((char, index) => (
                <span
                  key={index}
                  className={`relative ${
                    index < input.length
                      ? char === input[index]
                        ? 'text-[#50e3c2]'
                        : 'text-[#ff0000]'
                      : 'text-[#4a4a4a]'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full bg-[#1a1a1a] text-[#fafafa] text-xl p-4 rounded-md border border-[#333333] focus:outline-none focus:ring-1 focus:ring-[#50e3c2] focus:ring-opacity-50 mb-6 font-mono"
          placeholder="Start typing here..."
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-medium">
            <span className="mr-6">WPM: <span className="text-[#50e3c2]">{wpm}</span></span>
            <span>Accuracy: <span className="text-[#50e3c2]">{accuracy}%</span></span>
          </div>
          <button
            onClick={() => {
              fetchQuote()
              inputRef.current?.focus()
            }}
            disabled={isLoading}
            className="px-6 py-3 bg-[#50e3c2] text-black text-xl rounded-md hover:bg-[#3bc1a0] focus:outline-none focus:ring-2 focus:ring-[#50e3c2] focus:ring-opacity-50 transition-colors font-medium"
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'New Quote'
            )}
          </button>
        </div>
        <p className="text-sm text-[#666666] text-center">
          Type the text above. Press &quot;New Quote&quot; or finish the current text to get a new one.
        </p>
      </div>
    </div>
  )
}