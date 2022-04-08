import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  
  bgcolor: '#77A48B',
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function GamingResult({ handleClose, state }) {
  const getTitle = () => {
    switch (state.currentLine) {
      case 0:
        return "Gagné. La chaaaaaaatte !";
      case 1:
        return "Gagné. Bernard Pivot de la Duranne !";
      case 2:
        return "Gagné. Un talent comme toi, devrait être augmenté immédiatement !";
      case 3:
        return "Gagné. Moyenne : Note égale à la moitié de la note maximale.";
      case 4:
        return "Gagné. On en parlera lors de ton entretien annuel…";
      case 5:
        return "Gagné. C'est un peu la honte quand même…";
      case 6:
        return "Perdu. 0 + 0 = La tête à JUL !";
      default:
        return "";
    }
  };
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h4"
            component="h2"
            textAlign={"center"}
          >
            {getTitle()}
          </Typography>

          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Le mot était : {state.word}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
