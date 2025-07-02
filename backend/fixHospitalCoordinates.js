const mongoose = require('mongoose');
require('dotenv').config();

// Import the Hospital model
const Hospital = require('./models/Hospital');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for fixing coordinates'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to fix the coordinates
const fixCoordinates = async () => {
  try {
    // Get all hospitals
    const hospitals = await Hospital.find({});
    console.log(`Found ${hospitals.length} hospitals to fix`);
    
    // Loop through each hospital and swap coordinates
    for (const hospital of hospitals) {
      if (hospital.location && 
          hospital.location.type === 'Point' && 
          Array.isArray(hospital.location.coordinates) && 
          hospital.location.coordinates.length === 2) {
        
        // Get current coordinates
        const [lat, lng] = hospital.location.coordinates;
        
        // Swap them to [longitude, latitude] format
        hospital.location.coordinates = [lng, lat];
        
        // Save the updated hospital
        await hospital.save();
        console.log(`Fixed coordinates for ${hospital.name}`);
      }
    }
    
    console.log('All hospital coordinates have been fixed');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing coordinates:', error);
    process.exit(1);
  }
};

// Run the function
fixCoordinates();