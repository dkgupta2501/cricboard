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
