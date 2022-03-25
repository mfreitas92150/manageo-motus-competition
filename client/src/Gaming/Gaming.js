import React, { useCallback, useEffect, useState } from 'react';

import { differenceInSeconds } from 'date-fns'
import useEventListener from '@use-it/event-listener'
import { Box, Typography } from '@mui/material';
import GamingHeader from './GamingHeader';
import GamingKeyBoard from './GamingKeyBoard';
import GamingTestMode from './GamingTestMode';
import GamingGrid from './GamingGrid';
import styled from '@emotion/styled';

const MyBox = styled(Box)({
    display: "flex",
    alignItems: "center",
    flexDirection: "column"
})

export default function Gaming({ user, championship }) {

    const [startTime, setStartTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [endTime, setEndTime] = useState(null);

    const [lineCountStart, setLineCountStart] = useState(null);
    const [lineCountCurrent, setLineCountEnd] = useState(new Date());

    const [badWord, setBadWord] = useState(false)

    const [state, setState] = useState({
        currentLine: 0,
        guesses: [],
        goodChars: [],
        inButNoPlaceChars: [],
        badChars: [],
    });

    useEffect(() => {
        fetch(`/api/user/word?email=${user.email}&championship=${championship.id}`)
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
                    setStartTime(new Date())
                    setLineCountStart(new Date())
                    setLineCountEnd(new Date())
                }
            })

        const timer = setInterval(() => {
            setCurrentTime(new Date())
            setLineCountEnd(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [user.email, championship.id])

    const updateWord = useCallback((guess, guesses, success) => {
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
    }, [state, user.email])

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

            const guess = [...state.guesses[state.currentLine]]
            const guesses = [...state.guesses]
            updateWord(guess, guesses, false)

            setState({
                ...state,
                currentLine: state.currentLine + 1
            })
            if ((state.currentLine >= 5)) {
                setEndTime(new Date())
                setLineCountStart(null)
            }
        }
    }, [lineCountCurrent, lineCountStart, state, updateWord])


    const addChar = (char) => {
        if (!state.word || endTime) {
            return
        }
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
        if (!state.word) {
            return
        }
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
        if (!state.word || endTime) {
            return
        }
        const guess = [...state.guesses[state.currentLine]]
        const word = state.word
        const result = validWord(word, guess)
        const guesses = [...state.guesses]
        guesses[state.currentLine] = result
        const success = !result.find(c => c.state !== 2);

        updateWord(guess, guesses, success)

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
        if (success || (state.currentLine >= 5)) {
            setEndTime(new Date())
            setLineCountStart(null)
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
        if (!state.word) {
            return
        }
        const currentChar = event.key.length === 1 && event.key.toUpperCase().split()[0]
        const guess = state.guesses[state.currentLine]
        if (state.success) {
            return;
        }
        if (event.key === "Backspace" && guess.length > 1) {
            removeChar()
            setBadWord(false)
        } else if (event.key === "Enter" && guess.length === state.word.length) {
            fetch(`/api/user/valid?word=${guess.map(c => c.char).join('')}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        checkWord()
                    } else {
                        setBadWord(true)
                    }
                })

        } else if (currentChar && currentChar.match(/[A-Z]/g) && guess.length < state.word.length) {
            addChar(currentChar)
        }
    });

    return <div>
        <GamingHeader endTime={endTime} currentTime={currentTime} startTime={startTime} />
        {badWord && <Typography>Mot inconnu</Typography>}
        {process.env.REACT_APP_TEST_MODE === "true" && <GamingTestMode
            word={state.word}
            lineCountCurrent={lineCountCurrent}
            lineCountStart={lineCountStart}
            currentLine={state.currentLine}
            startTime={startTime}
            currentTime={currentTime}
            endTime={endTime}
        />}
        <MyBox>
            <GamingGrid
                guesses={state.guesses}
                word={state.word}
                currentLine={state.currentLine}
            />
            <GamingKeyBoard
                removeChar={removeChar}
                checkWord={checkWord}
                addChar={addChar}
                goodChars={state.goodChars}
                inButNoPlaceChars={state.inButNoPlaceChars}
                badChars={state.badChars}
            />
        </MyBox>

    </div>
}