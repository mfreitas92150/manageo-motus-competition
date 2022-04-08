import React from 'react';

import { styled } from '@mui/material/styles';
import { Grid, Stack } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const Item = styled(Grid)(({ theme }) => ({
    width: '2em',
    height: '2em',
    fontWeight: 'bold',
    fontSize: 25,
    border: '1px solid #FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    [theme.breakpoints.down('md')]: {

    },
}));

const GoodItem = styled(Item)({
    backgroundColor: '#EA6546',
})

const BadPlaceItem = styled(Grid)({
    width: '1.8em',
    height: '1.8em',
    borderRadius: '1.8em',
    backgroundColor: '#DAB14A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
})

const CurrentLineGrid = styled(Grid)({
    width: "2em",
})

const numberOfGuess = 6;

export default function GamingGrid({ guesses, word, currentLine }) {
    const rows = [];
    if (guesses.length) {
        for (let i = 0; i < numberOfGuess; i++) {
            let items = [];
            const guess = i < guesses.length ? guesses[i] : [];
            for (let j = 0; j < word.length; j++) {
                const colorIndex = guess.length > j ? guess[j].state : 0
                const charValue = guess.length > j ? guess[j].char : " ";
                let charGrid;
                if (colorIndex === 1) {
                    charGrid = <Item key={j}><BadPlaceItem>{charValue}</BadPlaceItem></Item>
                } else if (colorIndex === 2) {
                    charGrid = <GoodItem key={j}>{charValue}</GoodItem>
                } else if (colorIndex === 3) {
                    charGrid = <Item key={j}>.</Item>
                } else {
                    charGrid = <Item key={j}>{charValue}</Item>;
                }
                items.push(charGrid)
            }

            rows.push(<Stack direction="row" spacing={0} key={i}>
                <CurrentLineGrid container justifyContent={'center'} alignItems={'center'} >{i === currentLine && <ArrowRightIcon />}</CurrentLineGrid>
                {items}
            </Stack>)
        }
    }

    return <Grid>{rows}</Grid>
}
