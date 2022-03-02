import React, {useState} from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AdminAddWord({handleClose, submitWord}) {
  const[word, setWord] = useState("");
  return (
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Ajout d'un mot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ...
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="word"
            label="Mot"
            fullWidth
            variant="standard"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={() => {
              submitWord(word)
          }}>Ajouter</Button>
        </DialogActions>
      </Dialog>
  );
}
