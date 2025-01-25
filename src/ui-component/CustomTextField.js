// FormField.js
import React from "react";
import {
  TextField,
  MenuItem,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Checkbox,
  ListItemText,
  Autocomplete
} from "@mui/material";
const FormField = ({
  fieldConfig,
  formik,
  handleFileChange,
  handleOptionChange,
}) => {
  const inputProps = {
    onKeyDown: (e) => e.preventDefault(), // Prevent typing
    ...(fieldConfig.minDate && { min: fieldConfig.minDate }),
    ...(fieldConfig.maxDate && { max: fieldConfig.maxDate }),
  };
  const { type, label, options,disabled } = fieldConfig;
  switch (type) {
    case "text":
      return (
        <TextField
          label={label}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled={disabled ? true:false}
          {...formik.getFieldProps(fieldConfig.name)}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
          }
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
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
          }
          onChange={(event) => {
            formik.handleChange(event);
            handleOptionChange && handleOptionChange(event, formik);
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
      case "multiselect":
        return (
          <TextField
            select
            label={label}
            variant="outlined"
            fullWidth
            margin="normal"
            {...formik.getFieldProps(fieldConfig.name)}
            error={
              formik.touched[fieldConfig.name] &&
              Boolean(formik.errors[fieldConfig.name])
            }
            helperText={
              formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
            }
            onChange={(event) => {
              formik.handleChange(event);
              handleOptionChange && handleOptionChange(event, formik);
            }}
            SelectProps={{
              multiple: true, // Enable multiple selection
              renderValue: (selected) => (
                <div>
                  {selected.map((value) => (
                    <Chip key={value} label={options.find(option => option.value === value)?.label || value} />
                  ))}
                </div>
              ),
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={formik.values[fieldConfig.name].includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </TextField>
        );
      
    case "file":
      return (
        <div style={{ marginTop: "16px" }}>
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
            <Button
              variant="outlined"
              component="span"
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "10px",
                justifyContent: "flex-start",
              }}
            >
              {label}
              {" : "}
              <span style={{ color: "#2196f3", fontStyle: "italic" }}>
                {formik.values[fieldConfig.name]?.name || ""}
              </span>
            </Button>
          </label>
          {fieldConfig?.message && <div style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}>
          {fieldConfig?.message}
        </div>}
          {formik.touched[fieldConfig.name] &&
            formik.errors[fieldConfig.name] && (
              <div style={{ color: "red", marginTop: "8px" }}>
                {formik.errors[fieldConfig.name]}
              </div>
            )}
        </div>
      );
    case "radio":
      return (
        <FormControl style={{ width: "100%", marginBottom: "16px" }}>
          <fieldset
            className={`custom-fieldset ${
              formik.errors[fieldConfig.name] && "custom-fieldset-error"
            }`}
          >
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
          {formik.touched[fieldConfig.name] &&
            formik.errors[fieldConfig.name] && (
              <div
                style={{
                  color: "#f44336",
                  marginTop: "8px",
                  fontSize: "0.75rem",
                }}
              >
                {formik.errors[fieldConfig.name]}
              </div>
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
          disabled={disabled ? true:false}
          type="date"
          {...formik.getFieldProps(fieldConfig.name)}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps,
          }}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
          }
        />
      );
    case "tel":
      return (
        <TextField
          label={label}
          variant="outlined"
          fullWidth
          margin="normal"
          type="tel"
          disabled={disabled ? true:false}
          inputProps={{
            maxLength: 10,
            pattern: "[0-9]*"
          }}
          {...formik.getFieldProps(fieldConfig.name)}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
          }
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            formik.setFieldValue(fieldConfig.name, value);
          }}
        />
      );
    case "autocomplete":
      const currentValue = options.find(option => option.value === formik.values[fieldConfig.name]);
      return (
        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.label}
          value={currentValue || null} 
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, value) => {
            formik.setFieldValue(fieldConfig.name, value ? value.value : '');
            handleOptionChange && handleOptionChange(event, fieldConfig.name, value ? value.value : '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant="outlined"
              fullWidth
              margin="normal"
              error={
                formik.touched[fieldConfig.name] &&
                Boolean(formik.errors[fieldConfig.name])
              }
              helperText={
                formik.touched[fieldConfig.name] && formik.errors[fieldConfig.name]
              }
              {...formik.getFieldProps(fieldConfig.name)}
            />
          )}
        />
      );
    default:
      return null;
  }
};

export default FormField;
