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
import { useTranslation } from "react-i18next";


const FormField = ({
  fieldConfig,
  formik,
  handleFileChange,
  handleOptionChange,
}) => {
    const { t } = useTranslation();
  const inputProps = {
    onKeyDown: (e) => e.preventDefault(), // Prevent typing
    ...(fieldConfig.minDate && { min: fieldConfig.minDate }),
    ...(fieldConfig.maxDate && { max: fieldConfig.maxDate }),
  };
  const { type, label, options,disabled } = fieldConfig;
  const restrictedFields = ['name', 'title', 'category','company_name', 'companyName'];
  switch (type) {
    case "text":
      return (
        <TextField
          label={t(label)}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled={disabled ? true : false}
          {...formik.getFieldProps(fieldConfig.name)}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
          }
          onChange={(e) => {
            let value = e.target.value;
            
            // Remove potential XSS/script injection attempts
            value = value.replace(/<[^>]*>/g, ''); // Remove HTML tags
            value = value.replace(/javascript:/gi, ''); // Remove javascript: protocol
            value = value.replace(/on\w+\s*=/gi, ''); // Remove event handlers
            value = value.replace(/script/gi, ''); // Remove the word 'script'
            
            // Check if field is email type
            if (fieldConfig.name.toLowerCase().includes('email')) {
              const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
              if (value && !emailRegex.test(value)) {
                formik.setFieldError(fieldConfig.name, 'Please enter a valid email address');
              }
              formik.setFieldValue(fieldConfig.name, value);
            }
            // Check if field is one of the restricted fields
            else if (restrictedFields.includes(fieldConfig.name)) {
              // Only allow letters and single spaces, prevent consecutive spaces
              const sanitizedValue = value.replace(/\s+/g, ' '); // Replace multiple spaces with single space
              const letterOnlyValue = sanitizedValue.replace(/[^A-Za-z\s]/g, ''); // Remove non-letters
              formik.setFieldValue(fieldConfig.name, letterOnlyValue);
            } else {
              formik.setFieldValue(fieldConfig.name, value);
            }
          }}
        />
      );
    case "select":
      return (
        <TextField
          select
          label={t(label)}
          variant="outlined"
          fullWidth
          margin="normal"
          {...formik.getFieldProps(fieldConfig.name)}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
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
            label={t(label)}
            variant="outlined"
            fullWidth
            margin="normal"
            {...formik.getFieldProps(fieldConfig.name)}
            error={
              formik.touched[fieldConfig.name] &&
              Boolean(formik.errors[fieldConfig.name])
            }
            helperText={
              formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
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
            accept={fieldConfig.name === 'excel_file' ? 
              '.xlsx,.xls,.csv' : 
              '.pdf,.png,.jpg,.jpeg'}
            onChange={(originalEvent) => {
              // Store the original event data before async operations
              const file = originalEvent?.currentTarget?.files?.[0];
              const fieldName = originalEvent?.currentTarget?.name;

              if (!file) return;

              // Clear previous errors
              formik.setFieldError(fieldName, '');

              // Read file header to check signature
              const reader = new FileReader();
              reader.onerror = function() {
                formik.setFieldError(fieldName, 'Error reading file');
              };

              reader.onload = function(e) {
                const arr = new Uint8Array(e.target.result).subarray(0, 8);
                const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('');
                
                let isValidType = false;
                if (fieldConfig.name === 'excel_file') {
                  // Signatures for Excel and CSV files
                  const validSignatures = {
                    'xlsx': '504b34', // XLSX
                    'xls': 'd0cf11e0', // XLS
                    'csv': '', // CSV files don't have a specific signature
                  };
                  
                  // For CSV, check if it's a text file
                  if (file.type === 'text/csv') {
                    isValidType = true;
                  } else {
                    isValidType = Object.values(validSignatures).some(sig => sig && header.startsWith(sig));
                  }
                  
                  if (!isValidType) {
                    formik.setFieldError(fieldName, 'Only Excel and CSV files are allowed');
                    formik.setFieldValue(fieldName, ''); // Clear the field value
                    return;
                  }
                } else {
                  // Signatures for PDF and image files
                  const validSignatures = {
                    'pdf': '25504446', // PDF
                    'png': '89504e47', // PNG
                    'jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'], // JPEG variants
                  };
                  
                  isValidType = 
                    header.startsWith(validSignatures.pdf) || 
                    header.startsWith(validSignatures.png) || 
                    validSignatures.jpeg.some(sig => header.startsWith(sig));
                  
                  if (!isValidType) {
                    formik.setFieldError(fieldName, 'Only PDF, PNG, and JPG files are allowed');
                    formik.setFieldValue(fieldName, ''); // Clear the field value
                    return;
                  }
                }
                
                // If validation passes, update form and call handler
                if (isValidType) {
                  formik.setFieldValue(fieldName, file);
                  
                  // Call handleFileChange with a new event object
                  if (handleFileChange) {
                    const syntheticEvent = {
                      currentTarget: {
                        files: [file],
                        name: fieldName
                      },
                      target: {
                        files: [file],
                        name: fieldName
                      }
                    };
                    handleFileChange(syntheticEvent, formik);
                  }
                }
              };
              
              reader.readAsArrayBuffer(file);
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
              {t(label)}
              {" : "}
              <span style={{ color: "#2196f3", fontStyle: "italic" }}>
                {formik.values[fieldConfig.name]?.name || ""}
              </span>
            </Button>
          </label>
          {fieldConfig?.message && <div style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}>
            {t(fieldConfig?.message)}
          </div>}
          {formik.touched[fieldConfig.name] &&
            formik.errors[fieldConfig.name] && (
              <div style={{ color: "red", marginTop: "8px" }}>
                {t(formik.errors[fieldConfig.name])}
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
            <legend>{t(label)}</legend>
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
                {t(formik.errors[fieldConfig.name])}
              </div>
            )}
        </FormControl>
      );
    case "date":
      return (
        <TextField
          label={t(label)}
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
            formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
          }
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            
            // Check if the field is date of birth
            if (fieldConfig.name.toLowerCase().includes('dob') || fieldConfig.name.toLowerCase().includes('dateofbirth')) {
              const today = new Date();
              const age = today.getFullYear() - selectedDate.getFullYear();
              const monthDiff = today.getMonth() - selectedDate.getMonth();
              
              // Adjust age if birthday hasn't occurred this year
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                const actualAge = age - 1;
                if (actualAge < 18) {
                  formik.setFieldError(fieldConfig.name, 'Age must be 18 or above');
                  return;
                }
              } else if (age < 18) {
                formik.setFieldError(fieldConfig.name, 'Age must be 18 or above');
                return;
              }
            }
            
            formik.setFieldValue(fieldConfig.name, e.target.value);
          }}
        />
      );
    case "tel":
      return (
        <TextField
          label={t(label)}
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
            formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
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
              label={t(label)}
              variant="outlined"
              fullWidth
              margin="normal"
              error={
                formik.touched[fieldConfig.name] &&
                Boolean(formik.errors[fieldConfig.name])
              }
              helperText={
                formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
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