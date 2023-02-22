import React, { useState, } from "react";
import { Dialog, DialogTitle, DialogContent, } from '@mui/material/';
import { Typography, IconButton, } from '@mui/material/';
import CloseIcon from "@mui/icons-material/Close";


const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={ { m: 0, p: 2 } } { ...other }>
      { children }
      {
        onClose ? (
          <IconButton
            aria-label="close"
            onClick={ onClose }
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null
      }
    </DialogTitle>
  );
};

const AboutDialog = ({ open, handleClose, }) => {

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
      <BootstrapDialogTitle onClose={handleClose}>PRiSM Gesture Tracker (Demo)</BootstrapDialogTitle>
      <DialogContent dividers>
        <Typography sx={{ fontWeight: 500, }}>ABOUT</Typography>
        <Typography mt={2}>Demo version of the gesture tracking app developed at <a href="https://www.rncm.ac.uk/research/research-centres-rncm/prism/">RNCM PRiSM</a> for the piece <em>Forager</em>, by composer and computer music pioneer <a href="https://music.columbia.edu/bios/george-e-lewis">George Lewis</a>.</Typography>
        <Typography mt={2}>The app uses a <a href="https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm"><em>k</em>-Nearest-Neighbours</a> (<em>k</em>-NN) model with <a href="https://en.wikipedia.org/wiki/Dynamic_time_warping">Dynamic Time Warping</a> (DTW) to track a specific set of musical gestures in real time.</Typography>
        <Typography mt={2}>For pitch estimation it makes use of <a href="https://arxiv.org/pdf/1802.06182.pdf">CREPE</a>. This site is inspired by the (Chrome only) <a href="https://marl.github.io/crepe/">CREPE demo site</a>.</Typography>
        <Typography mt={2}>This is a demo version of the app, and was not used in the first performance of <em>Forager</em>.</Typography>
        <Typography mt={2} sx={{ fontWeight: 500, }}>ACKNOWLEDGEMENTS</Typography>
        <Typography mt={2}>Lead Developer: <a href="https://www.rncm.ac.uk/people/christopher-melen/">Dr Christopher Melen</a> (PRiSM Research Software Engineer).</Typography>
        <Typography mt={2}>With invaluable contributions from <a href="https://www.rncm.ac.uk/research/research-centres-rncm/prism/prism-blog/meet-the-prism-technical-director/">Professor David De Roure</a>, <a href="https://www.rncm.ac.uk/research/research-centres-rncm/prism/prism-news/dr-bofan-ma-appointed-rncm-prism-post-doctoral-research-associate/">Dr Bofan Ma</a>, and <a href="https://music.columbia.edu/bios/damon-holzborn">Damon Holzborn</a>.</Typography>
      </DialogContent>
    </Dialog>
  )
}

export default AboutDialog;
