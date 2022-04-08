import React from 'react';

import { styled } from '@mui/material/styles';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Grid, Stack, Paper, Box } from '@mui/material';

const MyRow = styled(Box)({
    margin: '0.5em 0'
})

const Item = styled(Grid)(({ theme }) => ({
    width: '1.9em',
    height: '1.9em',
    fontWeight: 'bold',
    fontSize: 18,
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
    width: '1.6em',
    height: '1.6em',
    borderRadius: '1em',
    backgroundColor: '#DAB14A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
})

const BadWord = styled(Item)({
    backgroundColor: '#D9CFD4',
    opacity: 0.5
})

const KeyBoardItem = styled(Paper)({
    fontWeight: 'bold',
    padding: '5px',
    margin: '5px',
    width: '30px',
    height: '30px'
});

const MyBackspaceIcon = styled(BackspaceIcon)({
    width: '15px',
    height: '15px',
})

const MySubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)({
    width: '15px',
    height: '15px',
})

const MyBox = styled(Box)({
    marginTop: "10px"
})

export default function GamingKeyBoard({ removeChar, checkWord, addChar, goodChars, inButNoPlaceChars, badChars }) {

    const getKeyBoardItem = (c, key) => {
        if (c === 'DEL') {
            return <Item size='small' key={key} variant='outlined' onClick={removeChar}><MyBackspaceIcon /></Item>
        }
        if (c === 'ENTER') {
            return <Item size='small' key={key} variant='outlined' onClick={checkWord}><MySubdirectoryArrowLeftIcon /></Item>
        }
        let style = {}
        if (goodChars.includes(c)) {
            return <GoodItem key={key} onClick={() => addChar(c)}>{c}</GoodItem>
        } else if (inButNoPlaceChars.includes(c)) {
            return <Item key={key} ><BadPlaceItem onClick={() => addChar(c)}>{c}</BadPlaceItem></Item>
        } else if (badChars.includes(c)) {
            style = {
                backgroundColor: "#D9CFD4",
                color: '#FFF'
            }
            return <BadWord key={key} onClick={() => addChar(c)}>{c}</BadWord>
        } 
        return <Item key={key} onClick={() => addChar(c)}>{c}</Item>
    }

    const keyboardRow1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'].map((c, key) => getKeyBoardItem(c, key))
    const keyboardRow3 = ['W', 'X', 'C', 'V', 'B', 'N', 'DEL', 'ENTER'].map((c, key) => getKeyBoardItem(c, key))

    return <MyBox>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow1}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow2}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow3}</Stack>
        </MyRow>
    </MyBox>
}