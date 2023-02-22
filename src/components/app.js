import React, { useReducer, useEffect, useRef, } from "react";
import { Box, Stack, Typography, Button, IconButton, FormControl, FormGroup, } from "@mui/material/";
import InfoIcon from "@mui/icons-material/Info";
import { createAudioInputAnalyser } from "../core/analyser";
import NumberInput from "./number-input";
import GestureList from "./gesture-list";
import ControlsGuide from "./controls-guide";
import AboutDialog from "./about-dialog";
import { svgRect, svgText, } from "./svg";
import { repeatN, } from "../../utils";
import inferno from "./inferno.json";


const NUM_INTERVALS = 360;
const CANVAS_WIDTH = 960;

const renderGestureCandidateFrame = (group, candidate, label, color="red") => {
  const candidateLength = candidate.length;
  const startPixel = CANVAS_WIDTH - candidateLength;

  let candidateMax = Math.max.apply(null, candidate);
  let candidateMin = Math.min.apply(null, candidate);

  const padding = 2;

  candidateMax = NUM_INTERVALS - candidateMax;
  candidateMin = NUM_INTERVALS - candidateMin;

  const x = startPixel;
  const y = candidateMax - padding;
  const width = candidateLength;
  const height = Math.abs(candidateMax - candidateMin) + (padding * 2);

  const frame = svgRect({ x, y, width, height, className: "gesture-candidate-frame", color, });
  group.appendChild( frame );
 
  const labelText = svgText(label, { x, y, size: "16px", color: "white", });
  group.appendChild( labelText );
}

const moveGestureCandidateFrameGroup = (svg, group) => {
  const lastOffsetX = group.getAttribute("data-offset-x");
  const offsetX = +lastOffsetX + 1;
  group.setAttribute("transform", `translate(-${offsetX},0)`);
  group.setAttribute("data-offset-x", `${offsetX}`);
  // Remove the frame group from the svg once it has moved
  // out of visibility completely...
  const { right } = group.getBoundingClientRect();
  if (right <= 0) {
    svg.removeChild(group);
  }
}

const initialState = {
  activationData: undefined,
  gestureCandidate: undefined,
  gestureCandidateLabel: undefined,
  k: 1,
  voicingConfidenceThreshold: 0.65,
  minGestureLength: 4,
  maxGestureSegmentGap: 2,
  isCapturing: undefined,
  showAboutDialog: false,
}

const appReducer = (state, action) => {
  const { type, payload } = action;
  switch(type) {
    case "SET_ACTIVATION_DATA":
      return { ...state, activationData: payload };
    case "SET_PREDICTED_GESTURE":
      const { gestureCandidate, gestureCandidateLabel, } = payload;
      return { ...state, gestureCandidate, gestureCandidateLabel, };
    case "SET_K":
      return { ...state, k: payload, };
    case "SET_VOICING_CONFIDENCE_THRESHOLD":
      return { ...state, voicingConfidenceThreshold: payload, };
    case "SET_MIN_GESTURE_LENGTH":
      return { ...state, minGestureLength: payload, };
    case "SET_MAX_GESTURE_SEGMENT_GAP":
      return { ...state, maxGestureSegmentGap: payload, };
    case "SET_IS_CAPTURING":
      return { ...state, isCapturing: !state.isCapturing, };
    case "SHOW_ABOUT_DIALOG":
      return { ...state, showAboutDialog: !state.showAboutDialog, };
    default:
      return state;
  }
}

const App = () => {

  const svgRef = useRef();
  const canvasRef = useRef();
  const imageDataRef = useRef();
  const analyserRef = useRef();
  const columnRef = useRef(0);

  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    imageDataRef.current = ctx.createImageData(width, height);
    analyserRef.current = await createAudioInputAnalyser({
      k: state.k,
      voicingConfidenceThreshold: state.voicingConfidenceThreshold,
      maxGestureSegmentGap: state.maxGestureSegmentGap,
      minGestureLength: state.minGestureLength,
      callback: (options) => {
        const { activation, gestureCandidate, predictedGesture, } = options;
        if (activation) {
          dispatch({ type: "SET_ACTIVATION_DATA", payload: activation, });
        }
        else if (gestureCandidate) {
          dispatch({
            type: "SET_PREDICTED_GESTURE",
            payload: {
              gestureCandidate: gestureCandidate,
              gestureCandidateLabel: predictedGesture,
            },
          });
        }
      },
    });
    inferno.forEach((_, i) => {
      const array = new Uint8ClampedArray(4);
      array.set(inferno[i]);
      inferno[i] = array;
    });
    //analyserRef.current.start();
  }, []);

  useEffect(() => {
    if (state.activationData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { width, height } = canvas;

      const buffer = imageDataRef.current;

      // render
      repeatN(360, (i) => {
        let value = Math.floor(state.activationData[i] * 256.0);
        if (isNaN(value) || value < 0) value = 0;
        if (value > 256) value = 1;
        buffer.data.set(inferno[value], ((height - 1 - i) * width + columnRef.current) * 4);
      });
      columnRef.current = (columnRef.current + 1) % width;
      ctx.putImageData(buffer, width - columnRef.current, 0);
      ctx.putImageData(buffer, -columnRef.current, 0);
    }
    const svg = svgRef.current;
    const groups = svg.querySelectorAll(".gesture-candidate-frame-group");
    if (groups.length > 0) {
      groups.forEach((group) => moveGestureCandidateFrameGroup(svg, group));
    }
  }, [state.activationData]);

  useEffect(() => {
    const { gestureCandidate, gestureCandidateLabel } = state;
    if (gestureCandidate && gestureCandidateLabel) {
      let [ label, ] = gestureCandidateLabel;
      const svg = svgRef.current;
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "gesture-candidate-frame-group");
      group.setAttribute("data-offset-x", 0);
      svg.appendChild( group );
      renderGestureCandidateFrame(group, gestureCandidate, label);
    }
  }, [state.gestureCandidate, state.gestureCandidateLabel]);

  useEffect(() => {
    if (state.isCapturing===true) {
      analyserRef.current.start();
     }
     else if (state.isCapturing===false) {
      analyserRef.current.stop();
     }
  }, [state.isCapturing]);

  const handleShowAboutDialog = (e) => {
    dispatch({ type: "SHOW_ABOUT_DIALOG", });
  }

  const handleClickStart = (e) => {
    dispatch({ type: "SET_IS_CAPTURING", });
    //analyserRef.current.start();
  }

  const handleChangeK = (e) => {
    const k = e.target.value;
    dispatch({ type: "SET_K", payload: +k, });
  }

  const handleSetVoicingConfidenceThreshold = (e) => {
    const { value } = e.target;
    dispatch({ type: "SET_VOICING_CONFIDENCE_THRESHOLD", payload: +value, });
    analyserRef.current.update("voicingConfidenceThreshold", +value);
  }

  const handleSetMinGestureLength = (e) => {
    const { value } = e.target;
    dispatch({ type: "SET_MIN_GESTURE_LENGTH", payload: +value, });
    analyserRef.current.update("minGestureLength", +value);
  }

  const handleSetMaxGestureSegmentGap = (e) => {
    const { value } = e.target;
    dispatch({ type: "SET_MAX_GESTURE_SEGMENT_GAP", payload: +value, });
    analyserRef.current.update("maxGestureSegmentGap", +value);
  }

  const canvasStyle = {
    background: "black",
    //width: "100%",
    //height: "100%",
  }

  return (
    <Box>
      <Stack>
        <Stack direction="row" style={{ margin: "auto", paddingTop: "20px", paddingBottom: "6px", }}>
          <Typography variant="h4">PRiSM Gesture Tracker (Demo)</Typography>
          <IconButton onClick={handleShowAboutDialog}>
            <InfoIcon />
          </IconButton>
        </Stack>
        <Box style={{ margin: "auto", paddingTop: "0px", paddingBottom: "20px", }}>
          <Typography>Click START to start live audio capture</Typography>
        </Box>
        <Box style={{ width: CANVAS_WIDTH, height: 360, margin: "auto" }}>
          <svg ref={svgRef} style={ { width: CANVAS_WIDTH, height: 360, } }>
            <foreignObject width={`${CANVAS_WIDTH}`} height="360">
              <canvas id="canvas" ref={canvasRef} width={`${CANVAS_WIDTH}`} height="360" style={ canvasStyle }/>
            </foreignObject>
          </svg>
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        style={{ paddingTop: "4px", paddingBottom: "20px", width: CANVAS_WIDTH, margin: "auto" }}
      >
        <FormGroup sx={{ flexGrow: 1, }} row>
          <Button
            size="small"
            color={ state.isCapturing ? "error" : "primary" }
            variant="contained"
            onClick={handleClickStart}
            sx={{ marginRight: "auto", }}
          >
            { state.isCapturing ? "STOP" : "START" }
          </Button>
        </FormGroup>
        <FormControl component="fieldset">
          <FormGroup row>
            <NumberInput
              label="Voicing confidence threshold"
              value={state.voicingConfidenceThreshold}
              handleChange={handleSetVoicingConfidenceThreshold}
              min={0.1}
              max={1.0}
              step={0.1}
            />
            <NumberInput
              label="Min gesture length"
              value={state.minGestureLength}
              handleChange={handleSetMinGestureLength}
              min={1}
            />
            <NumberInput
              label="Max gesture segment gap"
              value={state.maxGestureSegmentGap}
              handleChange={handleSetMaxGestureSegmentGap}
              min={1}
            />
          </FormGroup>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ maxWidth: CANVAS_WIDTH, margin: "auto", }}>
        <GestureList />
        <ControlsGuide />
      </Stack>
      <AboutDialog open={state.showAboutDialog} handleClose={handleShowAboutDialog}/>
    </Box>
  )
}

export default App;