const axios = require('axios');

exports.getStatesByCountry = async (req, res) => {
  try {
    const { country } = req.body;

    if (!country) {
      return res.status(400).json({ message: 'Country is required' });
    }

    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', {
      country,
    });

    if (response.data.error) {
      return res.status(500).json({ message: 'Error from external API', error: response.data.msg });
    }

    return res.status(200).json({
      country,
      states: response.data.data.states,
    });

  } catch (error) {
    console.error('Error fetching states:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCountryList = async (req, res) => {
    try {
      const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
  
      if (response.data.error) {
        return res.status(500).json({ message: 'Error from external API', error: response.data.msg });
      }
  
      return res.status(200).json({
        countries: response.data.data
      });
  
    } catch (error) {
      console.error('Error fetching countries:', error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  exports.getCitiesByState = async (req, res) => {
    try {
      const { country, state } = req.body;
  
      if (!country || !state) {
        return res.status(400).json({ message: 'Country and State are required' });
      }
  
      const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
        country,
        state
      });
  
      if (response.data.error) {
        return res.status(500).json({ message: 'Error from external API', error: response.data.msg });
      }
  
      return res.status(200).json({
        country,
        state,
        cities: response.data.data
      });
  
    } catch (error) {
      console.error('Error fetching cities:', error.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  const axios = require('axios');
const stateMap = require('../utils/stateMap');

exports.getCitiesByStateCodeOnly = async (req, res) => {
  try {
    const { state, state_code } = req.body;

    if (!state || !state_code) {
      return res.status(400).json({ message: 'state and state_code are required' });
    }

    // Assume India for now (you can extend later)
    const country = "India";
    const countryCode = "IN";

    const expectedState = stateMap[countryCode]?.[state_code];

    if (!expectedState) {
      return res.status(404).json({ message: `No matching state for code: ${state_code}` });
    }

    if (expectedState.toLowerCase() !== state.toLowerCase()) {
      return res.status(400).json({ message: `State name does not match state code: expected ${expectedState}` });
    }

    // Call external API
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
      country,
      state
    });

    if (response.data.error) {
      return res.status(500).json({ message: 'Error from external API', error: response.data.msg });
    }

    return res.status(200).json({
      country,
      state,
      state_code,
      cities: response.data.data
    });

  } catch (error) {
    console.error('Error fetching cities:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
