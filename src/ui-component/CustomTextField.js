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
  Autocomplete,
  Tooltip
} from "@mui/material";
import { useTranslation } from "react-i18next";


const FormField = ({
  fieldConfig,
  formik,
  handleFileChange,
  handleOptionChange,
  onChange,
}) => {
  const { t } = useTranslation();
  const inputProps = {
    onKeyDown: (e) => e.preventDefault(), // Prevent typing
    ...(fieldConfig.minDate && { min: fieldConfig.minDate }),
    ...(fieldConfig.maxDate && { max: fieldConfig.maxDate }),
  };
  const { type, label, options, disabled, placeholder } = fieldConfig;
  switch (type) {
    case "hidden":
      return (
        <input
          type="hidden"
          name={fieldConfig.name}
          value={formik.values[fieldConfig.name] || ""}
        />
      );
    case "text":
      return (
        <TextField
          label={t(label)}
          placeholder={placeholder ? t(placeholder) : ""}
          variant="outlined"
          fullWidth
          margin="normal"
          multiline={fieldConfig.multiline || false}
          rows={fieldConfig.rows || 1}
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
            value = value.replace(/<[^>]*>/g, ""); // Remove HTML tags
            value = value.replace(/javascript:/gi, ""); // Remove javascript: protocol
            value = value.replace(/on\w+\s*=/gi, ""); // Remove event handlers
            value = value.replace(/script/gi, ""); // Remove the word 'script'

            // Special handling for vehicle_number: always uppercase
            if (fieldConfig.name === "vehicle_number") {
              value = value.toUpperCase();
            }

            // Check if field is email type
            if (fieldConfig.name.toLowerCase().includes("email")) {
              const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
              if (value && !emailRegex.test(value)) {
                formik.setFieldError(fieldConfig.name, "Please enter a valid email address");
              }
              formik.setFieldValue(fieldConfig.name, value);
            }
            // Check if field is one of the restricted fields
            else if (["name", "title", "category"].includes(fieldConfig.name)) {
              // Only allow letters and single spaces, prevent consecutive spaces
              const sanitizedValue = value.replace(/\s+/g, " "); // Replace multiple spaces with single space
              const letterOnlyValue = sanitizedValue.replace(/[^A-Za-z\s]/g, ""); // Remove non-letters
              formik.setFieldValue(fieldConfig.name, letterOnlyValue);
            }
            // Check if field is a company-related name field
            else if (["company_name", "companyName", "org_name", "organization_name"].includes(fieldConfig.name)) {
              // Allow letters, numbers, and single spaces
              const sanitizedValue = value.replace(/\s+/g, " ");
              const alphanumericValue = sanitizedValue.replace(/[^A-Za-z0-9\s]/g, "");
              formik.setFieldValue(fieldConfig.name, alphanumericValue);
            } else {
              formik.setFieldValue(fieldConfig.name, value);
            }

            onChange && onChange(e);
          }}
        />
      );
    case "number": {
      const isLatField = fieldConfig.name === "lat";
      const isLonField = fieldConfig.name === "lon";

      // lon field is rendered inside the lat combined box — skip standalone render
      if (isLonField) {
        return null;
      }

      const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
          alert(t("Geolocation is not supported by this browser or requires a secure connection (HTTPS)."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            formik.setFieldValue("lat", String(latitude.toFixed(6)));
            formik.setFieldValue("lon", String(longitude.toFixed(6)));
          },
          (error) => {
            console.error("Geolocation error detail:", error);
            let msg = t("Unable to retrieve your location.");
            if (error.code === error.PERMISSION_DENIED) {
              msg = t("Location permission denied. Please enable it in browser settings.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              msg = t("Location information is unavailable (could be due to low signal or lack of GPS/Wi-Fi triangulation).");
            } else if (error.code === error.TIMEOUT) {
              msg = t("The request to get user location timed out. Try again or check your internet connection.");
            }
            alert(msg);
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
      };

      const numberField = (
        <TextField
          label={t(label)}
          variant="outlined"
          fullWidth
          type="number"
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
            const value = e.target.value;
            formik.setFieldValue(fieldConfig.name, value);
            onChange && onChange(e);
          }}
        />
      );

      if (!isLatField) {
        return (
          <TextField
            label={t(label)}
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
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
              const value = e.target.value;
              formik.setFieldValue(fieldConfig.name, value);
              onChange && onChange(e);
            }}
          />
        );
      }

      // Combined Lat + Lon + Button — inline, no extra wrapper box
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {/* Latitude */}
          <TextField
            label={t("Latitude")}
            variant="outlined"
            size="small"
            type="text"
            disabled={disabled ? true : false}
            {...formik.getFieldProps("lat")}
            error={formik.touched["lat"] && Boolean(formik.errors["lat"])}
            helperText={formik.touched["lat"] && t(formik.errors["lat"])}
            onChange={(e) => formik.setFieldValue("lat", e.target.value)}
            style={{ flex: 1 }}
          />

          {/* Longitude */}
          <TextField
            label={t("Longitude")}
            variant="outlined"
            size="small"
            type="text"
            disabled={disabled ? true : false}
            {...formik.getFieldProps("lon")}
            error={formik.touched["lon"] && Boolean(formik.errors["lon"])}
            helperText={formik.touched["lon"] && t(formik.errors["lon"])}
            onChange={(e) => formik.setFieldValue("lon", e.target.value)}
            style={{ flex: 1 }}
          />

          {/* Use My Location button */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleUseMyLocation}
            style={{
              whiteSpace: "nowrap",
              height: "40px",
              borderColor: "#1976d2",
              color: "#1976d2",
              flexShrink: 0,
            }}
          >
            {t("Use My Location")}
          </Button>
        </div>
      );
    }
    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values[fieldConfig.name] || false}
              onChange={(e) => {
                formik.setFieldValue(fieldConfig.name, e.target.checked);
              }}
              name={fieldConfig.name}
              color="primary"
            />
          }
          label={t(label)}
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
          disabled={disabled ? true : false}
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
              {t(option.label)}
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
      const isOfficialTechnicalOnboardingRequestLetter =
        fieldConfig.name === "file_officialTechnicalOnboardingRequestLetter";

      const isVehicleTypeApprovalTacAnnexureCopy =
        fieldConfig.name === "file_vehicleTypeApprovalTacAnnexureCopy";

      const isFactoryFitmentDeclaration =
        fieldConfig.name === "file_factoryFitmentDeclaration";

      const isAffidavitCumUndertakingBackendAccess =
        fieldConfig.name === "file_affidavitCumUndertakingBackendAccess";

      const isSelfCertifiedIdProofAuthorisedSignatory =
        fieldConfig.name === "file_selfCertifiedIdProofAuthorisedSignatory";

      // const officialTechnicalOnboardingRequestLetterTooltipTitle = (
      //   <div style={{ whiteSpace: "pre-line" }}>
      //     {"On company letterhead, duly signed by Director / Company Secretary / Partner/ Proprietor/ Authorised Signatory with company seal, clearly mentioning:\n"}
      //     {"• Purpose of onboarding\n"}
      //     {"• Vehicle model(s) involved\n"}
      //     {"• AIS-140 device make & model\n"}
      //     {"• Confirmation of factory fitment\n"}
      //     {"• Nodal officer details (Name, Designation, Email, Mobile)\n\n"}
      //     {"If signed by an officer other than Director/Company Secretary, / Partner/ Proprietor, corporate authorisation proof (Board Resolution extract / authorisation letter) must be enclosed."}
      //   </div>
      // );

      const vehicleTypeApprovalTacAnnexureCopyTooltipTitle = (
        <div style={{ whiteSpace: "pre-line" }}>
          {"Relevant annexure page showing factory integration of AIS-140 device in approved vehicle configuration.\n"}
          {"Must be stamped \"Certified True Copy\" and signed by authorised signatory."}
        </div>
      );

      const factoryFitmentDeclarationTooltipTitle = (
        <div style={{ whiteSpace: "pre-line" }}>
          {"On company letterhead, signed and sealed, confirming:\n"}
          {"• AIS-140 device model is factory fitted\n"}
          {"• Installation complies with AIS-140 and CMVR requirements\n"}
          {"• Proper integration of panic button, power backup and tamper detection\n"}
          {"• Vehicle Manufacturer assumes responsibility for installation integrity"}
        </div>
      );

      const affidavitCumUndertakingBackendAccessTooltipTitle = (
        <div style={{ whiteSpace: "pre-line" }}>
          {"To be executed on appropriate stamp paper and notarised as per prescribed format, covering:\n"}
          {"• Non-blacklisting declaration\n"}
          {"• Indemnity to Implementation Agency\n"}
          {"• Confidentiality & Non-disclosure\n"}
          {"• Data usage restrictions\n"}
          {"• Cybersecurity compliance\n"}
          {"• Limited and revocable access acknowledgement"}
        </div>
      );

      const selfCertifiedIdProofAuthorisedSignatoryTooltipTitle = "(PAN or Aadhaar)";

      return (
        <div style={{ marginTop: "16px" }}>
          <input
            id={fieldConfig.name}
            name={fieldConfig.name}
            type="file"
            accept={fieldConfig.name === 'excel_file' ?
              '.xlsx,.xls,.csv' :
              fieldConfig.name === 'file_bin' ?
                '.bin,.pac' :
                '.pdf,.png,.jpg,.jpeg'}
            onChange={(originalEvent) => {
              // Store the original event data before async operations
              const file = originalEvent?.currentTarget?.files?.[0];
              const fieldName = originalEvent?.currentTarget?.name;

              // Reset the input value so the same file can be selected again
              if (originalEvent.target) {
                originalEvent.target.value = null;
              }

              if (!file) return;

              const maxSize = 1024 * 1024; // 1 MB

              if (file.size > maxSize) {
                formik.setFieldValue(fieldName, '');
                formik.setFieldTouched(fieldName, true, false);
                setTimeout(() => {
                  formik.setFieldError(fieldName, 'File size should not exceed 1 MB');
                }, 0);
                return;
              }

              // Clear previous errors
              formik.setFieldError(fieldName, '');

              // Read file header to check signature
              const reader = new FileReader();
              reader.onerror = function () {
                setTimeout(() => {
                  formik.setFieldError(fieldName, 'Error reading file');
                }, 0);
              };

              reader.onload = function (e) {
                const arr = new Uint8Array(e.target.result).subarray(0, 8);
                const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('');

                let isValidType = false;
                if (fieldConfig.name === 'excel_file') {
                  // Signatures for Excel and CSV files
                  // Get file extension
                  const fileName = file.name.toLowerCase();
                  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

                  const validSignatures = {
                    'xlsx': '504b0304', // XLSX
                    'xls': 'd0cf11e0', // XLS
                    'csv': '', // CSV files don't have a specific signature
                  };

                  // Check file type, signature, and extension
                  if (file.type === 'text/csv' || fileExtension === '.csv') {
                    isValidType = true;
                  } else if (fileExtension === '.xlsx' && header.startsWith('504b0304')) {
                    // XLSX files with correct ZIP signature
                    isValidType = true;
                  } else if (fileExtension === '.xls' && header.startsWith('d0cf11e0')) {
                    // XLS files with correct OLE2 signature
                    isValidType = true;
                  } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
                    // Accept based on MIME type as fallback
                    isValidType = true;
                  }

                  if (!isValidType) {
                    formik.setFieldValue(fieldName, '');
                    formik.setFieldTouched(fieldName, true, false);
                    setTimeout(() => {
                      formik.setFieldError(fieldName, 'Invalid format: Only Excel (.xlsx, .xls) and CSV files are allowed');
                    }, 0);
                    return;
                  }
                } else if (fieldConfig.name === 'file_bin') {
                  // Validation for .bin and .pac firmware files
                  const fileName = file.name.toLowerCase();
                  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

                  // Check if the file has .bin or .pac extension
                  if (fileExtension === '.bin' || fileExtension === '.pac') {
                    isValidType = true;
                  }

                  if (!isValidType) {
                    formik.setFieldValue(fieldName, '');
                    formik.setFieldTouched(fieldName, true, false);
                    setTimeout(() => {
                      formik.setFieldError(fieldName, 'Invalid format: Only .bin and .pac firmware files are allowed');
                    }, 0);
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
                    formik.setFieldValue(fieldName, '');
                    formik.setFieldTouched(fieldName, true, false);
                    setTimeout(() => {
                      formik.setFieldError(fieldName, 'Invalid format: Only PDF, PNG, and JPG files are allowed');
                    }, 0);
                    return;
                  }
                }

                // If validation passes, update form and call handler
                if (isValidType) {
                  formik.setFieldValue(fieldName, file);
                  formik.setFieldError(fieldName, '');
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
            <Tooltip
              title={
                isVehicleTypeApprovalTacAnnexureCopy
                    ? vehicleTypeApprovalTacAnnexureCopyTooltipTitle
                    : isFactoryFitmentDeclaration
                      ? factoryFitmentDeclarationTooltipTitle
                      : isAffidavitCumUndertakingBackendAccess
                        ? affidavitCumUndertakingBackendAccessTooltipTitle
                        : isSelfCertifiedIdProofAuthorisedSignatory
                          ? selfCertifiedIdProofAuthorisedSignatoryTooltipTitle
                          : ""
              }
              arrow
              placement="top"
              disableHoverListener={!(
                isVehicleTypeApprovalTacAnnexureCopy ||
                isFactoryFitmentDeclaration ||
                isAffidavitCumUndertakingBackendAccess ||
                isSelfCertifiedIdProofAuthorisedSignatory
              )}
            >
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
            </Tooltip>
          </label>
          {fieldConfig?.downloadUrl ? (
            <div style={{ marginTop: "6px" }}>
              <Button
                variant="text"
                size="small"
                component="a"
                href={fieldConfig.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                style={{ paddingLeft: 0, textTransform: "none" }}
              >
                {t(fieldConfig?.downloadLabel || "Download format")}
              </Button>
            </div>
          ) : null}
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
            className={`custom-fieldset ${formik.errors[fieldConfig.name] && "custom-fieldset-error"
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
      // Calculate max date for 18 years old
      let maxDate = undefined;
      if (fieldConfig.name && (fieldConfig.name.toLowerCase().includes('dob') || fieldConfig.name.toLowerCase().includes('dateofbirth'))) {
        const today = new Date();
        maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
          .toISOString().split('T')[0];
      }
      return (
        <TextField
          label={t(label)}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled={disabled ? true : false}
          type="date"
          {...formik.getFieldProps(fieldConfig.name)}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: {
              ...inputProps,
              ...(maxDate ? { max: maxDate } : {}),
            },
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
              const testDate = "2000-01-01";
              if (e.target.value === testDate) {
                formik.setFieldValue(fieldConfig.name, e.target.value);
                onChange && onChange(e);
                return;
              }
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
            onChange && onChange(e);
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
          disabled={disabled ? true : false}
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
            onChange && onChange(e);
          }}
        />
      );
    case "time":
      return (
        <TextField
          label={t(label)}
          variant="outlined"
          fullWidth
          margin="normal"
          type="time"
          disabled={disabled ? true : false}
          {...formik.getFieldProps(fieldConfig.name)}
          InputLabelProps={{
            shrink: true,
          }}
          error={
            formik.touched[fieldConfig.name] &&
            Boolean(formik.errors[fieldConfig.name])
          }
          helperText={
            formik.touched[fieldConfig.name] && t(formik.errors[fieldConfig.name])
          }
          onChange={(e) => {
            formik.setFieldValue(fieldConfig.name, e.target.value);
            onChange && onChange(e);
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
