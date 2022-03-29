import React, { useEffect, useState } from 'react';
import { Grid, Stack, Typography, Button } from '@mui/material';

import Gaming from './Gaming'

export default function GamingHome({ user }) {
    const [championship, setChampionship] = useState({})

    useEffect(() => {
        fetch(`/api/user/championship?email=${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                setChampionship(data)
            })
    }, [user])

    return <Grid>
        {!championship.id && <Typography>Aucun championnat prévu</Typography>}
        {championship.id && !championship.participate && <Typography>Le championnat <b>{championship.name}</b> est en cours mais vous n'êtes pas inscrit.</Typography>}
        {championship.participate && <Gaming user={user} championship={championship} />}
    </Grid>

}