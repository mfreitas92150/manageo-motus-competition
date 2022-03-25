import React from 'react';

import { styled } from '@mui/material/styles';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

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

export default function GamingKeyBoard({ removeChar, checkWord, addChar, goodChars, inButNoPlaceChars, badChars }) {

    const getKeyBoardItem = (c, key) => {
        if (c === 'DEL') {
            return <KeyBoardItem size='small' key={key} variant='outlined' onClick={removeChar}><MyBackspaceIcon /></KeyBoardItem>
        }
        if (c === 'ENTER') {
            return <KeyBoardItem size='small' key={key} variant='outlined' onClick={checkWord}><MySubdirectoryArrowLeftIcon /></KeyBoardItem>
        }
        let style = {}
        if (goodChars.includes(c)) {
            style = {
                backgroundColor: "#388AEA",
                color: '#FFF'
            }
        } else if (inButNoPlaceChars.includes(c)) {
            style = {
                backgroundColor: "#FEF83C"
            }
        } else if (badChars.includes(c)) {
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

    return <>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow1}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow2}</Stack>
        </MyRow>
        <MyRow>
            <Stack direction="row" spacing={1}>{keyboardRow3}</Stack>
        </MyRow>
    </>
}