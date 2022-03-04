import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import useEventListener from '@use-it/event-listener'
import { Container } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: '50px',
    color: theme.palette.text.secondary,
}));

const MyStack = styled(Stack)(({ }) => ({
    marginTop: "10px"
}))

const GreenTypography = styled(Typography)({
    color: '#71CC51'
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
        guess.pop()
        const guesses = [...state.guesses]
        guesses[state.currentLigne] = guess
        setState({
            ...state,
            currentGuess: guess,
            guesses
        })
    }

    const checkWord = () => {

        const guess = [...state.guesses[state.currentLigne]]
        const word = state.word
        const checkedGuess = [guess[0]]
        for (let i = 1; i < word.length; i++) {
            const guessChar = guess[i].char;

            if (word[i] === guessChar) {
                checkedGuess.push({
                    char: guessChar,
                    state: 2
                })
            } else if (word.substring(1).includes(guessChar)) {
                checkedGuess.push({
                    char: guessChar,
                    state: 1
                })
            } else {
                checkedGuess.push({
                    char: guessChar,
                    state: 0
                })
            }
        }
        const guesses = [...state.guesses]
        guesses[state.currentLigne] = checkedGuess
        const currentGuess = String(state.currentGuess.map(g => g.char)).replaceAll(',', '')
        const success = currentGuess === state.word;
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
                    backgroundColor: colorIndex === 1 ? "#E13D31" : "#3798EC"
                }
                items.push(<Item key={j} style={style}>{guess.length > j ? guess[j].char : " "}</Item>)
            }
            rows.push(<MyStack direction="row" spacing={2} key={i} style={{}}>{items}</MyStack>)
        }
    }


    return state.word ? (<Container>
        {state.success && <GreenTypography>
            <ThumbUpIcon />
            {`Réussi. Vous gagnez ${numberOfGuess - state.currentLigne} points`}
            <ThumbUpIcon />
        </GreenTypography>}
        <Box sx={{}}>
            {state.word}
            {rows}
        </Box>
    </Container>
    ) : (
        <Typography paragraph>
            Chargement du mot
        </Typography>
    );
}

