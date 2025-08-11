import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
}

const SearchBar: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock search suggestions for healthcare cohorts
  const searchSuggestions: SearchResult[] = [
    {
      id: '1',
      title: 'All Patients',
      category: 'Cohort',
      description: 'Complete patient dataset',
    },
    {
      id: '2',
      title: 'I10_Hypertension',
      category: 'Diagnosis',
      description: 'Patients with hypertension diagnosis',
    },
    {
      id: '3',
      title: 'J45_Asthma',
      category: 'Diagnosis',
      description: 'Patients with asthma diagnosis',
    },
    {
      id: '4',
      title: 'K21_Reflux',
      category: 'Diagnosis',
      description: 'Patients with gastroesophageal reflux',
    },
    {
      id: '5',
      title: 'E11_Type2Diabetes',
      category: 'Diagnosis',
      description: 'Patients with Type 2 diabetes',
    },
    {
      id: '6',
      title: 'Smokers',
      category: 'Risk Factor',
      description: 'Patients who smoke',
    },
    {
      id: '7',
      title: 'Age > 65',
      category: 'Demographics',
      description: 'Senior patients',
    },
    {
      id: '8',
      title: 'BMI > 30',
      category: 'Health Metrics',
      description: 'Obese patients',
    },
  ];

  const filteredSuggestions = searchSuggestions.filter((suggestion) =>
    suggestion.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSearch = (value: string) => {
    if (value) {
      console.log('🔍 Searching for:', value);
      // Here you would trigger the actual search/filter functionality
      // This could update the exploration dashboard or navigate to results
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 320 : 200 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Autocomplete
        freeSolo
        options={filteredSuggestions}
        inputValue={searchValue}
        onInputChange={(event, newValue) => {
          setSearchValue(newValue);
        }}
        onChange={(event, value) => {
          if (typeof value === 'string') {
            handleSearch(value);
          } else if (value) {
            handleSearch(value.title);
            setSearchValue(value.title);
          }
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          return option.title;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search cohorts, conditions..."
            variant="outlined"
            size="small"
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchValue('')}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {option.title}
                </Typography>
                <Chip
                  label={option.category}
                  size="small"
                  color="primary"
                  sx={{ ml: 'auto', fontSize: '0.75rem' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            </Box>
          </Box>
        )}
        PaperComponent={(props) => (
          <Paper
            {...props}
            sx={{
              mt: 1,
              backgroundColor: 'background.paper',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'var(--shadow-xl)',
            }}
          />
        )}
      />
    </motion.div>
  );
};

export default SearchBar;