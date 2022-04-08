import React, { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const MyStack = styled(Stack)(() => ({
    margin: '50px 0'
}))

export default function UserChampionship({ championship, handleClose }) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(`/api/championship/user?id=${championship.id}`)
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, [championship.id])

    return <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Ajout d'utilisateurs aux championnat <b>{championship.name}</b>
            </Typography>
            <form onSubmit={(e) => {
                e.preventDefault()
                fetch(`/api/championship/user?id=${championship.id}`, {
                    method: "PUT",
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(users)
                })
                handleClose()
            }}>
                <MyStack spacing={3}>
                    {users.map((user, key) => <Stack key={key} direction="row">
                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={user.participate}
                                    onClick={() => {
                                        setUsers(users.map(u => {
                                            if (u.email === user.email) {
                                                return {
                                                    email: u.email,
                                                    participate: !u.participate
                                                }
                                            }
                                            return u
                                        }))
                                    }}
                                />} label={user.email} />
                        </FormGroup>
                    </Stack>)}
                    <Button variant="contained" type="submit">
                        Ajouter
                    </Button>
                </MyStack>
            </form>
        </Box>
    </Modal >
}