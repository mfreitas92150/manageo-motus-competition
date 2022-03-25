import React from 'react';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Box, color } from '@mui/system';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: '50px',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    border: "solid 1px #3AAEF0",
}));

const MyStack = styled(Stack)(() => ({
}))

const GridBox = styled(Paper)(() => ({
    // background: "#2196F3"
    background: "#2196F3"
}))

const numberOfGuess = 6;

export default function GamingGrid({ guesses, word, currentLine }) {
    const rows = [];
    if (guesses.length) {
        for (let i = 0; i < numberOfGuess; i++) {
            let items = [];
            const guess = i < guesses.length ? guesses[i] : [];
            for (let j = 0; j < word.length; j++) {
                const colorIndex = guess.length > j ? guess[j].state : 0
                let backgroundColor = "#2196F3";
                if (colorIndex === 1) {
                    backgroundColor = "#FEF83C";
                } else if (colorIndex === 2) {
                    backgroundColor = "#F44336";
                } 
                items.push(<Item key={j} style={{
                    backgroundColor: backgroundColor
                }}>{guess.length > j ? guess[j].char : " "}</Item>)
            }
            rows.push(<MyStack direction="row" spacing={0} key={i}>{items}</MyStack>)
        }
    }

    return <GridBox>
        {rows}
    </GridBox>
}
