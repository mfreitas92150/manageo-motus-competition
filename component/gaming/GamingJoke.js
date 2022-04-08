import React from 'react';

import styled from '@emotion/styled';
import { Grid, Paper } from '@mui/material';

const JokesGrid = styled(Grid)({
    width: '25em',
    height: '35em',
    overflowX: 'hidden',
    overflowY: 'auto',
    border: '1px solid #FFF',
})

const JokePaper = styled(Paper)({
    margin: '1em',
    padding: '0.2em 1em ',
    textAlign: 'right'
})

export default function Gamingjoke({ jokes }) {

    return <JokesGrid>
        {jokes.map((joke, key) => {
            return <JokePaper key={key}  elevation={3}>{joke}</JokePaper>
        })}
    </JokesGrid>
}