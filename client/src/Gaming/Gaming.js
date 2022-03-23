import React, { useEffect, useState } from 'react';

import { format, differenceInSeconds } from 'date-fns'
import useEventListener from '@use-it/event-listener'

export default function Gaming({ user }) {

    const [startTime] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    const [lineCountStart, setLineCountStart] = useState(new Date());
    const [lineCountCurrent, setLineCountEnd] = useState(new Date());

    const [intervalId, setIntervalId] = useState(null)

    const [state, setState] = useState({
        currentLine: 0,
        guesses: []
    });



    useEffect(() => {
        fetch(`/api/user/word?email=${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                const guesses = JSON.parse(data.guesses);
                const goods = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 2).map(g => g.char)
                const almosts = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 1).map(g => g.char)
                const bads = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 0).map(g => g.char)
                setState({
                    word: data.word,
                    currentGuess: JSON.parse(data.current_guess),
                    currentLine: data.current_line,
                    guesses: guesses,
                    success: data.success,
                    id: data.id,
                    goodChars: goods,
                    inButNoPlaceChars: almosts,
                    badChars: bads,
                })
                if (!data.success && data.current_line < 6) {
                    const timer = setInterval(() => {
                        setCurrentTime(new Date())
                        setLineCountEnd(new Date())
                    }, 1000)
                    setIntervalId(timer)
                }
            })
    }, [startTime])

    useEffect(() => {
        if (!state.word) {
            return
        }
        if (state.currentLine >= 6) {
            return
        }
        if (differenceInSeconds(lineCountCurrent, lineCountStart) >= process.env.REACT_APP_GAMING_LINE_COUNTER) {
            setLineCountStart(new Date())
            setLineCountEnd(new Date())
            setState({
                ...state,
                currentLine: state.currentLine + 1
            })
        }
    }, [lineCountCurrent, lineCountStart, state])

    const displayTime = format(new Date(currentTime - startTime), 'mm:ss')

    const addChar = (char) => {
        const guess = [...state.guesses[state.currentLine], {
            char: char,
            state: 0
        }]
        const guesses = [...state.guesses]
        guesses[state.currentLine] = guess
        setState({
            ...state,
            guesses
        })
    }

    const removeChar = () => {
        const guess = [...state.guesses[state.currentLine]]
        if (guess.length > 1) {
            guess.pop()
            const guesses = [...state.guesses]
            guesses[state.currentLine] = guess
            setState({
                ...state,
                guesses
            })
        }

    }

    const checkWord = () => {
        const guess = [...state.guesses[state.currentLine]]
        const word = state.word
        const result = validWord(word, guess)
        const guesses = [...state.guesses]
        guesses[state.currentLine] = result
        const success = !result.find(c => c.state !== 2);

        fetch("/api/user/word", {
            method: "PUT",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: state.word,
                current_guess: guess,
                current_line: success ? state.currentLine : state.currentLine + 1,
                guesses,
                success,
                email: user.email,
                id: state.id
            })
        })

        const goods = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 2).map(g => g.char)
        const almosts = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 1).map(g => g.char)
        const bads = guesses.flatMap(g => g.filter((c, index) => index > 0)).filter(g => g.state === 0).map(g => g.char)

        setState({
            ...state,
            guesses,
            success,
            goodChars: goods,
            inButNoPlaceChars: almosts,
            badChars: bads,
            currentLine: success ? state.currentLine : state.currentLine + 1,
        })
        setLineCountStart(new Date())
        setLineCountEnd(new Date())
        if (success) {
            clearInterval(intervalId)
        }
    }

    const validWord = (word, guess) => {
        const validWord = word.substring(1).split('')
        const charToFind = word.substring(1).split('')
        const guessWord = guess.filter((c, index) => index > 0).map(g => g.char)

        const newGuess = guessWord.map((g, index) => {
            const wChar = validWord[index];
            let state = 0;
            if (wChar === g) {
                state = 2
                const i = charToFind.indexOf(g);
                charToFind.splice(i, 1);
            }
            return {
                char: g,
                state
            }
        })

        return [
            {
                char: word.substring(0, 1),
                state: 2
            },
            ...newGuess.map((g, index) => {
                if (g.state !== 2 && charToFind.includes(g.char)) {
                    const i = charToFind.indexOf(g);
                    charToFind.splice(i, 1);
                    return {
                        char: g.char,
                        state: 1
                    }
                }
                return g
            })]
    }

    useEventListener('keydown', (event) => {
        const currentChar = event.key.length === 1 && event.key.toUpperCase().split()[0]
        const guess = state.guesses[state.currentLine]
        if (state.success) {
            return;
        }
        if (event.key === "Backspace" && guess.length > 1) {
            removeChar()
        } else if (event.key === "Enter" && guess.length === state.word.length) {
            checkWord()
        } else if (currentChar && currentChar.match(/[A-Z]/g) && guess.length < state.word.length) {
            addChar(currentChar)
        }
    });

    return <div>
        <h2>Jeux {displayTime}</h2>
        <p>mot: {state.word}</p>
        <p>diff: {differenceInSeconds(lineCountCurrent, lineCountStart)}</p>
        <p>currentLine: {state.currentLine}</p>
        <div>{state.guesses.map((guess, key) => <p key={key}>{guess.map(c => `${c.char}:${c.state} `)}<br /></p>)}</div>
    </div>
}