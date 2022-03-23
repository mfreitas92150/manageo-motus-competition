import React, { useState } from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, Stack, Typography } from '@mui/material';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

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


export default function CreateChampionship({ element, handleClose }) {
    const [championship, setChampionship] = useState(element);
    
    return <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                {championship.id ? "Mettre à jour" : "Créer"} championnat
            </Typography>
            <form onSubmit={(e) => {
                e.preventDefault()
                if (championship.id) {
                    fetch("/api/ranking/championships", {
                        method: "PUT",
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...championship
                        })
                    })
                } else {
                    fetch("/api/ranking/championships", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...championship
                        })
                    })
                }
                handleClose()
            }}>
                <MyStack spacing={3}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Nom"
                        value={championship.name}
                        onChange={(e) => setChampionship({
                            ...championship,
                            name: e.target.value
                        })}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>

                        <DesktopDatePicker
                            label="Date de début"
                            inputFormat="dd/MM/yyyy"
                            value={championship.begin}
                            onChange={(date) => setChampionship({
                                ...championship,
                                begin: date
                            })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <DesktopDatePicker
                            label="Date de fin"
                            inputFormat="dd/MM/yyyy"
                            value={championship.end}
                            onChange={(date) => setChampionship({
                                ...championship,
                                end: date
                            })}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <Button variant="contained" type="submit">
                        {championship.id ? "Mettre à jour" : "Créer"}
                    </Button>
                </MyStack>
            </form>
        </Box>
    </Modal>
}