import React, { useState } from 'react';
import { Autocomplete, TextField, MenuItem, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const CustomAutocomplete = ({ options, label, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleInputChange = (event, value) => {
    setInputValue(value);

    if (value) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  };

  const handleOptionChange = (event, value) => {
    setSelectedOption(value); // Set the selected option
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ inputValue: selectedOption?.label || inputValue, selectedOption });
    }
  };

  // Detect Enter key press for form submission
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission

      // If an option is focused, ensure it gets selected before submit
      const focusedOption = filteredOptions.find(
        (option) => option.label.toLowerCase() === inputValue.toLowerCase()
      );

      if (focusedOption) {
        setSelectedOption(focusedOption); // Select the focused option
      }

      handleSubmit(); // Call submit with the latest selected option
    }
  };

  return (
    <Autocomplete
      options={filteredOptions}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleOptionChange}
      value={selectedOption || null}
      disableClearable
      popupIcon={null} // Removes the dropdown arrow (caret icon)
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          variant="outlined"
          onKeyDown={handleKeyDown} // Detect Enter key press
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSubmit} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <MenuItem {...props}>{option.label}</MenuItem>
      )}
    />
  );
};

export default CustomAutocomplete;
