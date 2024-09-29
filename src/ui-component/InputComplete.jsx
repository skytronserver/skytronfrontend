import React, { useState } from 'react';
import { Autocomplete, TextField, MenuItem } from '@mui/material';

const InputComplete = ({
  label,
  options,
  onChange,
  onInputChange,
  inputValue,
  selectedOption,
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);

  const handleInputChange = (event, value) => {
    onInputChange(value);

    // Filter options based on the input value
    if (value) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]); // Clear options if input is empty
    }
  };

  return (
    <Autocomplete
      options={filteredOptions} // Show filtered options
      getOptionLabel={(option) => option.label} // Get label to display
      isOptionEqualToValue={(option, value) => option.value === value?.value} // Compare by value
      inputValue={inputValue} // Input value binding
      onInputChange={handleInputChange} // Handle input changes
      onChange={onChange} // Handle option selection
      value={selectedOption} // Bind selected value
      renderInput={(params) => (
        <TextField
          {...params}
          label={label} // Dynamically set label
          fullWidth
          variant="outlined"
        />
      )}
      renderOption={(props, option) => (
        <MenuItem {...props}>
          {option.label}
        </MenuItem>
      )}
    />
  );
};

export default InputComplete;
