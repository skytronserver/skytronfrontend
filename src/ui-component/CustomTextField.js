// FormField.js
import React from "react";
import { TextField, MenuItem, Button,Radio, RadioGroup, FormControlLabel,FormControl } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
const FormField = ({ fieldConfig, formik, handleFileChange }) => {
  const { type, label, options } = fieldConfig;
  switch (type) {
    case "text":
      return (
        <TextField
          label={label}
          variant="outlined"
          fullWidth
          margin="normal"
          {...formik.getFieldProps(fieldConfig.name)}
          error={formik.touched[fieldConfig.name] && Boolean(formik.errors[fieldConfig.name])}
          helperText={formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]}
        />
      );
    case "select":
      return (
        <TextField
          select
          label={label}
          variant="outlined"
          fullWidth
          margin="normal"
          {...formik.getFieldProps(fieldConfig.name)}
          error={formik.touched[fieldConfig.name] && Boolean(formik.errors[fieldConfig.name])}
          helperText={formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]}
        >
          
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    case "file":
      return (
        <div style={{marginTop:"16px"}}>
          <input
            id={fieldConfig.name}
            name={fieldConfig.name}
            type="file"
            onChange={(event) => {
              formik.handleChange(event);
              handleFileChange(event, formik);
            }}
            onBlur={() => formik.setFieldTouched(fieldConfig.name, true)}
            style={{ display: "none" }}
            
          />
          <label htmlFor={fieldConfig.name}>
            <Button variant="outlined" component="span" style={{width:"100%",height:"50px",borderRadius:"10px",justifyContent:"flex-start"}}>
              {label}{" : "}
              <span style={{ color: "#2196f3", fontStyle: "italic" }}>
              {formik.values[fieldConfig.name]?.name || ""}
            </span>
            </Button>
            
          </label>
          {formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name] && (
            <div style={{ color: "red", marginTop: "8px" }}>{formik.errors[fieldConfig.name]}</div>
          )}
        </div>
      );
      case "radio":
      return (
        <FormControl style={{width:"100%",marginBottom:"16px"}}>
           <fieldset className={`custom-fieldset ${formik.errors[fieldConfig.name] && "custom-fieldset-error"}`} >
          <legend>{label}</legend>
          <RadioGroup
            row
            aria-label={label}
            name={fieldConfig.name}
            value={formik.values[fieldConfig.name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          </fieldset>
          {formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name] && (
            <div style={{ color: "#f44336", marginTop: "8px", fontSize:"0.75rem"}}>{formik.errors[fieldConfig.name]}</div>
          )}
        </FormControl>
      );
      case "date":
        return (
          <TextField
            label={label}
            variant="outlined"
            fullWidth
            margin="normal"
            type="date"
            {...formik.getFieldProps(fieldConfig.name)}
            InputLabelProps={{
              shrink: true,
            }}
            error={formik.touched[fieldConfig.name] && Boolean(formik.errors[fieldConfig.name])}
            helperText={formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]}
          />
        );
    default:
      return null;
  }
};

export default FormField;
