import React from "react";
import { TextField, Typography, } from "@mui/material/";
import { styled } from "@mui/material/styles";


const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    maxWidth: "80px",
    '& fieldset': {
      borderRadius: 0,
      //borderColor: 'white',
    },
    '&:hover fieldset': {
      borderWidth: "1.5px",
      borderRadius: 0,
      //borderColor: 'white',
    },
  },
});

const NumberInput = ({
    value,
    handleChange,
    label,
    labelPlacement="start",
    disabled,
    min=1,
    max=100,
    step=1,
  }) => {

  const labelStyle = { margin: "auto 6px", };
  const inputStyle ={
    padding: "4px 10px",
    marginTop: "auto",
    marginBottom: "auto",
  };

  return (
    <>
      { label && labelPlacement.toLowerCase()==="start" &&
        <Typography
          component="label"
          style={ labelStyle }
        >
          { label }
        </Typography>
      }
      <CustomTextField
        type="number"
        size="small"
        disabled={disabled}
        value={value}
        onChange={handleChange}
        inputProps={{
          min: min,
          max: max,
          step: step,
          style: { inputStyle }
        }}
      />
      { label && labelPlacement.toLowerCase()==="end" &&
        <Typography
          component="label"
          style={ labelStyle }
        >
          { label }
        </Typography>
      }
    </>
  )
}

export default NumberInput;