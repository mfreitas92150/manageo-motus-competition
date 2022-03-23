import React, { useEffect, useState, useCallback, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';

import useEventListener from '@use-it/event-listener'
import { Container } from '@mui/material';

import { format, differenceInMinutes } from 'date-fns'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: '50px',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
}));

const KeyBoardItem = styled(Paper)(() => ({
    fontWeight: 'bold',
    padding: '10px',
}));

const MyStack = styled(Stack)(() => ({
    marginTop: "10px"
}))

const GreenTypography = styled(Typography)({
    color: '#71CC51'
})

const RedTypography = styled(Typography)({
    color: '#B00403'
})


const MyBox = styled(Box)({
    margin: '20px 20px'
})

const MyRow = styled(Box)({
    margin: '5px 20px'
})

const MyBackspaceIcon = styled(BackspaceIcon)({
    width: '15px',
    height: '15px'
})

const MySubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)({
    width: '15px',
    height: '15px'
})


export default function Gaming({ user }) {

    const [state, setState] = useState({
        id: null,
        word: null,
        guesses: [],
        success: null,
        goodChars: [],
        inButNoPlaceChars: [],
        badChars: [],
        startDate: null,
    });

    const [currentLine, setCurrentLine] = useState(0)
    const [startDate, setStartDate] = useState(null)
    const [currentDate, setCurrentDate] = useState(null)
    const [timer, setTimer] = useState(null)
    const [timerLine, setTimerLine] = useState(null)

    const numberOfGuess = 6;

    const addChar = (char) => {
        const guess = [...state.guesses[currentLine], {
            char: char,
            state: 0
        }]
        const guesses = [...state.guesses]
        guesses[currentLine] = guess
        setState({
            ...state,
            currentGuess: guess,
            guesses
        })
    }

    const removeChar = () => {
        const guess = [...state.guesses[currentLine]]
        if (guess.length > 1) {
            guess.pop()
            const guesses = [...state.guesses]
            guesses[currentLine] = guess
            setState({
                ...state,
                currentGuess: guess,
                guesses
            })
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

    const checkWord = () => {
        const guess = [...state.guesses[currentLine]]
        const word = state.word
        const result = validWord(word, guess)
        const guesses = [...state.guesses]
        guesses[currentLine] = result
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
                current_line: success ? currentLine : currentLine + 1,
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
        })

        setCurrentLine(success ? currentLine : currentLine + 1)

        if (success || currentLine >= 5) {
            clearInterval(timer)
            setTimer(null)
            clearInterval(timerLine)
            setTimerLine(null)
        }
    }

    useEventListener('keydown', (event) => {
        const currentChar = event.key.length === 1 && event.key.toUpperCase().split()[0]
        const guess = state.guesses[currentLine]
        if (state.success) {
            return;
        }
        if (event.key === "Backspace" && guess.length > 1) {
            removeChar()
        } else if (event.key === "Enter" && guess.length === state.word.length) {
            checkWord()
        } else if (currentChar && currentChar.match(/[A-Z]/g) && state.guesses[currentLine].length < state.word.length) {
            addChar(currentChar)
        }
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
                    currentLigne: data.current_line,
                    guesses: guesses,
                    success: data.success,
                    id: data.id,
                    goodChars: goods,
                    inButNoPlaceChars: almosts,
                    badChars: bads,
                })
                setStartDate(new Date())
            });
    }, [user.email]);

    useEffect(() => {
        if (!timer && startDate && !state.success && currentLine !== 6) {
            const t = setInterval(() => {
                setCurrentDate(new Date())
            }, 1000)

            setTimer(t)
        }
    }, [startDate, state, timer])

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            let id = setInterval(() => {
                savedCallback.current();
            }, delay);
            return () => clearInterval(id);
        }, [delay]);
    }

    useInterval(() => {
        if (state.word && !state.success && currentLine !== 6) {
            setCurrentLine(currentLine + 1);
        }
    }, 5000);


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
                } else if (i > currentLine) {
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


    const displayTimer = () => {
        const display = format(new Date(currentDate - startDate), 'mm:ss')
        const diff = differenceInMinutes(currentDate, startDate)
        const message1 = diff >= 1 && diff < 2 && <span style={{ color: '#D1C06C' }}>Courage tu peux le faire</span>
        const message2 = diff >= 2 && <span style={{ color: '#DE9239' }}>Allez là ! accélère</span>
        return <Typography>
            Temps dans le jeu : {display}<br />
            {message1}
            {message2}
        </Typography>
    }

    return state.word ? (<Container>
        {state.success && <GreenTypography>
            <ThumbUpIcon />
            {`Réussi. Vous gagnez ${numberOfGuess - currentLine} points`}
            <ThumbUpIcon />
        </GreenTypography>}
        {currentLine === 6 && !state.success && <RedTypography>
            <ThumbDownIcon />
            Echec. Vous marqez 0 point. Le mot était {state.word}. <br />
            Vous êtes trop mauvais. Revenez demain.
            <ThumbDownIcon />
        </RedTypography>}
        {currentDate && displayTimer()}
        <MyBox>
            {process.env.REACT_APP_TEST_MODE && `${state.word} currentLine : ${currentLine}`}
            {rows}
        </MyBox>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow1}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow2}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow3}</Stack>
        </MyRow>
    </Container>
    ) : (
        <Typography paragraph>
            Chargement du mot
        </Typography>
    );
}

