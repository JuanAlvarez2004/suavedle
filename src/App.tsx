import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { useEffect, useRef, useState } from "react"

const WORDS = [
  "bacano",
  "chevere",
  "chimba",
  "parcero",
  "parce",
  "vaina",
  "parche",
  "rumbear",
  "guayabo",
  "paila",
  "maluco",
  "sapo",
  "luca",
  "cache",
  "camellar",
  "cantaleta",
  "chepe",
  "chepea",
  "chepeoso",
  "chepaso",
  "chepa",
  "cuadrar",
  "cumbamba",
  "amorchis",
  "morchi",
  "arruncharse",
  "motodo",
  "motoso",
  "achantar",
  "emberrar",
  "encarretar",
  "entusado",
  "rayado",
  "tragado",
  "cucho",
  "llave",
  "man",
  "pelao",
  "pelada",
  "sardo",
  "sarda",
  "mono",
  "mona",
  "tombo",
  "guambito",
  "guambita",
  "desparchado",
  "guachafita",
  "jincho",
  "prendido",
  "recocha",
  "cachaco",
  "rolo",
  "paisa",
  "pastuso",
  "tolimense",
  "valluno",
  "corroncho",
  "costeno",
  "tocayo",
  "afanar",
  "rebusque",
  "sardina",
  "toche",
  "yeyo",
  "napa",
  "retoche",
  "pata",
  "tricon",
  "pico",
  "nave",
  "carcacha",
  "buseta",
  "colectivo",
  "coleta",
  "mula",
  "piso",
  "pola",
  "tinto",
  "corrientazo",
  "chuzo",
  "arepa",
  "changua",
  "chunchurria",
  "cuncho",
  "ejecutivo",
  "guarulo",
  "pintado",
  "cotufa",
  "boleta",
  "culebra",
  "de",
  "una",
  "jartera",
  "lampara",
  "lobo",
  "loba",
  "locha",
  "mamera",
  "mane",
  "plata",
  "pupitrazo",
  "reventar",
  "parar",
  "bolas",
  "vaina",
  "dar",
  "pata",
  "abrirse",
  "calentura",
  "fariseo",
  "lagarto",
  "ni",
  "vainas",
  "darse",
  "garra"
]

const CONFIG = {
  tries: 6
}

interface data {
  word: string
  length: number
}

interface gameState {
  currTry: number
  currGuess: string[]
}

gsap.registerPlugin(SplitText)

function App() {
  const [data, setData] = useState<data | null>(null)
  const [board, setBoard] = useState<string[][]>([])
  const [gameState, setGameState] = useState<gameState>({
    currTry: 0,
    currGuess: []
  })
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const splitTitleRef = useRef<SplitText | null>(null)
  const isTitleAnimatingRef = useRef(false)

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    const wordLength = randomWord.length

    setData({
      word: randomWord,
      length: wordLength
    })

    setBoard(
      Array.from({ length: CONFIG.tries }, () => Array(wordLength).fill(""))
    )
    setGameState({
      currTry: 0,
      currGuess: Array(wordLength).fill("")
    })

    inputRefs.current = Array.from({ length: CONFIG.tries }, () =>
      Array(wordLength).fill(null)
    )

    if (!titleRef.current) return

    splitTitleRef.current = new SplitText(titleRef.current, { type: "chars" })

    return () => {
      if (splitTitleRef.current) {
        splitTitleRef.current.revert()
        splitTitleRef.current = null
      }
      isTitleAnimatingRef.current = false
    }
  }, [])

  const focusCell = (row: number, col: number) => {
    inputRefs.current[row]?.[col]?.focus()
  }

  const updateRowGuess = (row: number, rowValues: string[]) => {
    if (row === gameState.currTry) {
      setGameState((prev) => ({ ...prev, currGuess: rowValues }))
    }
  }

  const setCellValue = (row: number, col: number, value: string) => {
    setBoard((prev) => {
      const next = prev.map((r) => [...r])
      if (!next[row]) return prev

      next[row][col] = value
      updateRowGuess(row, next[row])
      return next
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    if (!data || row !== gameState.currTry) return

    const char = e.target.value
      .slice(-1)
      .toLowerCase()
      .replace(/[^a-z]/g, "")
    setCellValue(row, col, char)

    if (char && col < data.length - 1) {
      focusCell(row, col + 1)
    }
  }

  const handleEnterOrSubmit = () => {
    if (!data) return

    if (gameState.currTry >= CONFIG.tries) return

    if (gameState.currGuess.includes("")) {
      const row = document.getElementById(gameState.currTry.toString())
      gsap.from(row, { x: -5, duration: 0.1, yoyo: true, repeat: 4 })
      return
    }

    for (let i = 0; i < data.length; i++) {
      if (gameState.currGuess[i] === data.word[i]) {
        gsap.to(inputRefs.current[gameState.currTry][i], {
          backgroundColor: "purple",
          color: "white",
          duration: 0.5
        })
      } else if (data.word.includes(gameState.currGuess[i])) {
        gsap.to(inputRefs.current[gameState.currTry][i], {
          backgroundColor: "yellow",
          color: "black",
          duration: 0.5
        })
      } else {
        gsap.to(inputRefs.current[gameState.currTry][i], {
          backgroundColor: "black",
          color: "white",
          duration: 0.5
        })
      }
    }

    if (gameState.currGuess.join("") === data.word) {
      document.querySelector(".dialog-congrats")?.classList.remove("invisible")
      setGameState((prev) => ({
        ...prev,
        currTry: CONFIG.tries
      }))
      return
    }

    setGameState((prev) => ({
      ...prev,
      currTry: prev.currTry + 1,
      currGuess: Array(data.length).fill("")
    }))
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    if (!data || row !== gameState.currTry) return

    if (e.key === "Backspace") {
      e.preventDefault()

      const currentValue = board[row]?.[col] ?? ""
      if (currentValue) {
        setCellValue(row, col, "")
        return
      }

      if (col > 0) {
        setCellValue(row, col - 1, "")
        focusCell(row, col - 1)
      }
      return
    } else if (e.key === "ArrowLeft" && col > 0) {
      e.preventDefault()
      focusCell(row, col - 1)
      return
    } else if (e.key === "ArrowRight" && col < data.length - 1) {
      e.preventDefault()
      focusCell(row, col + 1)
    } else if (e.key === "Enter") {
      e.preventDefault()

      handleEnterOrSubmit()
    }
  }

  const handleAnimationTitle = () => {
    if (!splitTitleRef.current || isTitleAnimatingRef.current) return

    isTitleAnimatingRef.current = true

    splitTitleRef.current.chars.forEach((char, index) => {
      gsap.to(char, {
        y: -10,
        delay: index * 0.05,
        yoyo: true,
        repeat: 1,
        overwrite: true,
        onComplete: () => {
          isTitleAnimatingRef.current = false
        },
        onInterrupt: () => {
          isTitleAnimatingRef.current = false
        },
        ease: "power1.inOut",
        duration: 0.3
      })
    })
  }

  const renderInput = () => {
    if (!data || board.length === 0) return null

    const result = []
    for (let row = 0; row < CONFIG.tries; row++) {
      const inputs = []
      for (let col = 0; col < data.length; col++) {
        inputs.push(
          <input
            key={col}
            ref={(el) => {
              if (!inputRefs.current[row]) {
                inputRefs.current[row] = Array(data.length).fill(null)
              }
              inputRefs.current[row][col] = el
            }}
            value={board[row]?.[col] ?? ""}
            onChange={(e) => handleChange(e, row, col)}
            onKeyDown={(e) => handleKeyDown(e, row, col)}
            type="text"
            maxLength={1}
            disabled={row !== gameState.currTry}
            className="w-12 h-12 mx-1 text-center text-2xl font-bold border-2 border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400"
          />
        )
      }

      result.push(
        <div key={row} id={row.toString()} className="flex justify-center">
          {inputs}
        </div>
      )
    }
    return result
  }

  return (
    <div className="mx-8 grid place-content-center h-dvh relative font-dot-gothic">
      
      <div className="dialog-congrats absolute inset-0 grid place-content-center invisible">
        <div className="congrats-box relative bg-black text-white max-w-sm rounded-lg after:absolute after:content-[''] after:bg-white after:h-22 after:w-13 after:left-0 after:top-0 after:rounded-br-lg before:absolute before:content-[''] before:bg-white before:h-22 before:w-13 before:right-0 before:top-0 before:rounded-bl-lg">
          <div className="congrats-box-title">Felicidades</div>
          <div className="congrats-box-content relative text-justify py-9 px-5"><span>{data?.word.toUpperCase()}</span> es lorem ipsum dolor sit amet consectetur adipisicing elit. Porro nostrum eveniet non odio nam! Molestias commodi, expedita dolorem temporibus, consequatur incidunt explicabo quam excepturi, rerum maxime officiis vitae tempora deserunt!</div>
        </div>
      </div>
      
      <h1
        ref={titleRef}
        onMouseEnter={handleAnimationTitle}
        id="title"
        className="text-9xl font-bold font-array-bold"
      >
        SUAVEDLE
      </h1>
      <p>{data?.word}</p>
      <div className="flex flex-col justify-center items-center gap-3">
        {renderInput()}
        <button
          onClick={handleEnterOrSubmit}
          className="border font-bold py-2 px-4 rounded w-35 hover:bg-black hover:text-white transition-all cursor-crosshair active:scale-95 hover:scale-105"
        >
          A la de Dios
        </button>
      </div>
    </div>
  )
}

export default App
