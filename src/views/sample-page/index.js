import React, { useState } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import InputComplete from '../../ui-component/InputComplete'; // Import the reusable component

const SamplePage = () => {
  const options = [
    { value: 'abc', label: 'ABC' },
    { value: 'pqr', label: 'PQR' }
  ];

  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  console.log(inputValue,selectedOption)
  return (
    <MainCard>
      <InputComplete
        label="Vehicle Registration No" // Custom label
        options={options} // Pass options
        inputValue={inputValue} // Input value
        selectedOption={selectedOption} // Selected value
        onInputChange={setInputValue} // Handle input change
        onChange={(event, value) => setSelectedOption(value)} // Handle option selection
      />
    
    </MainCard>
  );
};

export default SamplePage;
