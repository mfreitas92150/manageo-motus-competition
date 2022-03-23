import { Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function GamingHome({ user }) {
    const [championship, setChampionship] = useState({})
    useEffect(() => {
        fetch(`/api/user/championship?email=${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                setChampionship(data)
            })
    }, [user])

    return <Container>
        {!championship.id && <Typography>Aucun championnat prévu</Typography>}
        {!championship.participate && <Typography>Le championnat <b>{championship.name}</b> est en cours mais vous n'êtes pas inscrit.</Typography>}
    </Container>

}