import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { format, differenceInSeconds } from 'date-fns'
import useEventListener from '@use-it/event-listener'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Typography } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: '50px',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
}));


const MyStack = styled(Stack)(() => ({
    marginTop: "10px"
}))

const MyBox = styled(Box)({
    margin: '20px 20px'
})

const MyRow = styled(Box)({
    margin: '5px 20px'
})

const KeyBoardItem = styled(Paper)({
    fontWeight: 'bold',
    padding: '10px',
});

const MyBackspaceIcon = styled(BackspaceIcon)({
    width: '15px',
    height: '15px'
})

const MySubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)({
    width: '15px',
    height: '15px'
})

const numberOfGuess = 6;

export default function Gaming({ user }) {

    const [startTime] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    const [lineCountStart, setLineCountStart] = useState(new Date());
    const [lineCountCurrent, setLineCountEnd] = useState(new Date());

    const [intervalId, setIntervalId] = useState(null)

    const [badWord, setBadWord] = useState(false)

    const [state, setState] = useState({
        currentLine: 0,
        guesses: [],
        goodChars: [],
        inButNoPlaceChars: [],
        badChars: [],
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
            setBadWord(false)
        } else if (event.key === "Enter" && guess.length === state.word.length) {
            fetch(`/api/user/valide?word=${guess.map(c => c.char).join('')}`)
                .then(data => {
                    if (data === "true") {
                        checkWord()
                    } else {
                        setBadWord(true)
                    }
                })

        } else if (currentChar && currentChar.match(/[A-Z]/g) && guess.length < state.word.length) {
            addChar(currentChar)
        }
    });

    const rows = [];
    if (state.guesses.length) {
        for (let i = 0; i < numberOfGuess; i++) {
            let items = [];
            const guess = i < state.guesses.length ? state.guesses[i] : [];
            for (let j = 0; j < state.word.length; j++) {
                const colorIndex = guess.length > j ? guess[j].state : 0
                let backgroundColor = "#F6F7FA";
                if (colorIndex === 1) {
                    backgroundColor = "#FEF83C";
                } else if (colorIndex === 2) {
                    backgroundColor = "#388AEA";
                } else if (i > state.currentLine) {
                    backgroundColor = "#DFDFDF";
                }
                items.push(<Item key={j} style={{
                    backgroundColor: backgroundColor
                }}>{guess.length > j ? guess[j].char : " "}</Item>)
            }
            rows.push(<MyStack direction="row" spacing={1} key={i}>{items}</MyStack>)
        }
    }
    const getKeyBoardItem = (c, key) => {
        if (c === 'DEL') {
            return <KeyBoardItem size='small' key={key} variant='outlined' onClick={removeChar}><MyBackspaceIcon /></KeyBoardItem>
        }
        if (c === 'ENTER') {
            return <KeyBoardItem size='small' key={key} variant='outlined' onClick={checkWord}><MySubdirectoryArrowLeftIcon /></KeyBoardItem>
        }
        let style = {}
        if (state.goodChars.includes(c)) {
            style = {
                backgroundColor: "#388AEA",
                color: '#FFF'
            }
        } else if (state.inButNoPlaceChars.includes(c)) {
            style = {
                backgroundColor: "#FEF83C"
            }
        } else if (state.badChars.includes(c)) {
            style = {
                backgroundColor: "#D9CFD4",
                color: '#FFF'
            }
        }
        return <KeyBoardItem key={key} style={style} onClick={() => addChar(c)}>{c}</KeyBoardItem>
    }

    const keyboardRow1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow3 = ['W', 'X', 'C', 'V', 'B', 'N', 'DEL', 'ENTER'].map((c, key) => getKeyBoardItem(c, key))

    return <div>
        <h2>Jeux {displayTime}</h2> 
        {badWord && <Typography>Mot inconnu</Typography>}
        {process.env.REACT_APP_TEST_MODE === "true" && <p>mot: {state.word}</p>}
        {process.env.REACT_APP_TEST_MODE === "true" && <p>diff: {differenceInSeconds(lineCountCurrent, lineCountStart)}</p>}
        {process.env.REACT_APP_TEST_MODE === "true" && <p>currentLine: {state.currentLine}</p>}
        {process.env.REACT_APP_TEST_MODE === "true" && <div>{state.guesses.map((guess, key) => <p key={key}>{guess.map(c => `${c.char}:${c.state} `)}<br /></p>)}</div>}
        {rows}
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow1}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow2}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow3}</Stack>
        </MyRow>
    </div>
}