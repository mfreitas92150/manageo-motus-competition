import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';

import useEventListener from '@use-it/event-listener'
import { Container } from '@mui/material';

import Button from '@mui/material/Button';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: '50px',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
}));

const KeyBoardItem = styled(Button)(() => ({
    
}));

const MyStack = styled(Stack)(({ }) => ({
    marginTop: "10px"
}))

const GreenTypography = styled(Typography)({
    color: '#71CC51'
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
        word: null,
        currentGuess: [],
        currentLigne: 0,
        guesses: [],
        success: false,
    });

    const numberOfGuess = 6;

    const addChar = (char) => {
        const guess = [...state.guesses[state.currentLigne], {
            char: char,
            state: 0
        }]
        const guesses = [...state.guesses]
        guesses[state.currentLigne] = guess
        setState({
            ...state,
            currentGuess: guess,
            guesses
        })
    }

    const removeChar = () => {
        const guess = [...state.guesses[state.currentLigne]]
        if (guess.length > 1) {
            guess.pop()
            const guesses = [...state.guesses]
            guesses[state.currentLigne] = guess
            setState({
                ...state,
                currentGuess: guess,
                guesses
            })
        }

    }

    const validWord = (word, guess) => {
        const validWord = word.substring(1).split('')
        let charToFind = word.substring(1).split('')
        const guessWord = guess.filter((g, index) => index > 0).map(g => g.char)
    
        return [
            {
                char: word.substring(0, 1),
                state: 2
            },
            ...guessWord.map((g, index) => {
                const wChar = validWord[index];
                let state = 0;
                if (wChar === g) {
                    state = 2
                    var index = charToFind.indexOf(g);
                    charToFind = charToFind.splice(index, 1);
                } else if (charToFind.includes(g)) {
                    state = 1
                    var index = charToFind.indexOf(g);
                    charToFind = charToFind.splice(index, 1);
                }
                return {
                    char: g,
                    state
                }
            })]
    }
    
    const checkWord = () => {
        const guess = [...state.guesses[state.currentLigne]]
        const word = state.word
        const result = validWord(word, guess)
        const guesses = [...state.guesses]
        guesses[state.currentLigne] = result
        const success = !result.find(c => c.state !== 2);
        if (success) {
            fetch("/api/user/rank", {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...user,
                    point: numberOfGuess - state.currentLigne
                })
            })
        }
        setState({
            ...state,
            currentGuess: guess,
            guesses,
            currentLigne: success ? state.currentLigne : state.currentLigne + 1,
            success
        })
    }

    useEventListener('keydown', (event) => {
        const currentChar = event.key.length === 1 && event.key.toUpperCase().split()[0]
        if (state.success) {
            return;
        }
        if (event.key === "Backspace" && state.currentGuess.length > 1) {
            removeChar()
        } else if (event.key === "Enter" && state.currentGuess.length === state.word.length) {
            checkWord()
        } else if (currentChar && currentChar.match(/[A-Z]/g) && state.guesses[state.currentLigne].length < state.word.length) {
            addChar(currentChar)
        }
    });

    useEffect(() => {
        fetch(`/api/word`)
            .then((res) => res.json())
            .then((data) => {
                const word = data.word.toUpperCase();
                const charWord = [...word]
                let guesses = [];
                for (let i = 0; i < word.length; i++) {
                    guesses.push([{
                        char: charWord[0],
                        state: 2
                    }])
                }
                const newState = {
                    word,
                    currentGuess: [{
                        char: charWord[0],
                        state: 0
                    }],
                    currentLigne: 0,
                    guesses,
                };
                setState(newState);
            });
    }, []);
    let rows = [];
    if (state.guesses.length) {
        for (let i = 0; i < numberOfGuess; i++) {
            let items = [];
            const guess = i < state.guesses.length ? state.guesses[i] : [];
            for (let j = 0; j < state.word.length; j++) {
                const char = guess.length > j ? guess[j].word : " "
                const colorIndex = guess.length > j ? guess[j].state : 0
                const style = colorIndex === 0 ? {} : {
                    backgroundColor: colorIndex === 1 ? "#FEF83C" : "#388AEA"
                }
                items.push(<Item key={j} style={style}>{guess.length > j ? guess[j].char : " "}</Item>)
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
        return <KeyBoardItem size='small' key={key} variant='outlined' onClick={() => addChar(c)}>{c}</KeyBoardItem>
    }

    const keyboardRow1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow3 = ['W', 'X', 'C', 'V', 'B', 'N', 'DEL', 'ENTER'].map((c, key) => getKeyBoardItem(c, key))

    return state.word ? (<Container>
        {state.success && <GreenTypography>
            <ThumbUpIcon />
            {`Réussi. Vous gagnez ${numberOfGuess - state.currentLigne} points`}
            <ThumbUpIcon />
        </GreenTypography>}
        <MyBox>
            {process.env.REACT_APP_TEST_MODE && state.word}
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

