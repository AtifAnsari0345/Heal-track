const mongoose = require('mongoose');
require('dotenv').config();

// Import the Hospital model
const Hospital = require('./models/Hospital');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample hospital data with CORRECT GeoJSON Point locations
// NOTE: coordinates are in [longitude, latitude] order
const hospitals = [
  {
    name: "City Hospital & Research Centre",
    location: {
      type: "Point",
      coordinates: [
        72.88189,  // Longitude FIRST
        19.08127   // Latitude SECOND
      ]
    },
    address: "Sagar Palace A, City, Sonapur Ln, Friends Colony, Kurla West, Kurla, Mumbai, Maharashtra 400070",
    phone: "099870 38888",
    hasAmbulance: true,
    operatingHours: "24/7"
  },
  {
    "_id": {
      "$oid": "6838308f0b3e07aa85dfac8b"
    },
    "name": "CritiCare Asia Multi Specialty Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.076364,
        72.88624
      ]
    },
    "address": "Building No 1, Kirol Rd, off LBS Marg, near Kohinoor International School, Ali Yavar Jung, Kurla West, Kurla, Mumbai, Maharashtra 400070",
    "phone": "022 6755 6755",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849947e8ca2ccbf86d6636e"
    },
    "name": "Suraj Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.07437,
        72.88374
      ]
    },
    "address": "Hans Residency Ground Floor, D Wing Halav Pool, Near Albarkat School, Kurla West, Maharashtra 400070",
    "phone": "093242 05787",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "684996d88ca2ccbf86d66382"
    },
    "name": "Fauziya Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.07985,
        72.88009
      ]
    },
    "address": "209, Fauziya Hospital, Solanki Apartment, LBS Marg, Kurla West, Kurla, Mumbai, Maharashtra 400070",
    "phone": "09930056004",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849976d8ca2ccbf86d66385"
    },
    "name": "Apollo Hospital, Navi Mumbai",
    "location": {
      "type": "Point",
      "coordinates": [
        19.02305,
        73.02816
      ]
    },
    "address": "Plot #13, Parsik Hill Rd, off Uran Road, opp. Nerul Wonders Park, Sector 23, CBD Belapur, Navi Mumbai, Maharashtra 400614",
    "phone": "022 3350 3350",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849981e8ca2ccbf86d66387"
    },
    "name": "New Noor Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.07763,
        72.87797
      ]
    },
    "address": "Kurla Bus Depot Junction , Hallow Pul, LBS Marg, Friends Colony, Kurla West, Kurla, Mumbai, Maharashtra 400070",
    "phone": "091378 80996",
    "hasAmbulance": false,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "684998d08ca2ccbf86d6638a"
    },
    "name": "Apollo Spectra Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.04844,
        72.91122
      ]
    },
    "address": "2WW6+VCW, apollo spectra hospital, Ujagar Compund Opp. Deonar Bus Depot Main GAte, MBPT Colony, Best Colony, Chembur, Mumbai, Maharashtra 400088",
    "phone": "08448440991",
    "hasAmbulance": true,
    "operatingHours": "7am - 9pm (Sunday closed)"
  },
  {
    "_id": {
      "$oid": "684999ad8ca2ccbf86d6638c"
    },
    "name": "Zen Multi Speciality Hospital, Chembur, Mumbai",
    "location": {
      "type": "Point",
      "coordinates": [
        19.05734,
        72.89662
      ]
    },
    "address": "Plot No, 425, 10th Rd, near Sandu Garden, Jai Ambe Nagar, Chembur Gaothan, Chembur, Mumbai, Maharashtra 400071",
    "phone": "02235205600",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "68499acf8ca2ccbf86d6638f"
    },
    "name": "Sushrut Hospital & Research Centre In Chembur | Mumbai",
    "location": {
      "type": "Point",
      "coordinates": [
        19.05791,
        72.88941
      ]
    },
    "address": "365, Sant Vershaw Kakkaya Marg, Swastik Park, Chembur, Mumbai, Maharashtra 400071",
    "phone": "09372745480",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "68499c088ca2ccbf86d66392"
    },
    "name": "SRV Hospitals - Chembur",
    "location": {
      "type": "Point",
      "coordinates": [
        19.0682,
        72.89258
      ]
    },
    "address": "Dr Mandakini Parihar Marg, opposite Lokmanya Tilak Terminus, Shell Colony, Tilak Nagar, Chembur, Mumbai, Maharashtra 400089",
    "phone": "08451800800",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "68499d0e8ca2ccbf86d66394"
    },
    "name": "Surana Sethia Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.0549,
        72.88683
      ]
    },
    "address": "Sion - Trombay Rd, Suman Nagar, Chembur, Mumbai, Maharashtra 400071",
    "phone": "02233783378",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849a81057ece21e2cfd73eb"
    },
    "name": "Chembur Hospital and ICCU",
    "location": {
      "type": "Point",
      "coordinates": [
        19.05459,
        72.89763
      ]
    },
    "address": "1st Flr, XLNC Chambers, C-408, Sion - Trombay Rd, opp. IDBI Bank, near Diamond Garden, Chembur, Mumbai, Maharashtra 400071",
    "phone": "09819931234",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849a92e57ece21e2cfd73ed"
    },
    "name": "SevenHills Hospital Ambulance",
    "location": {
      "type": "Point",
      "coordinates": [
        19.35649,
        72.86682
      ]
    },
    "address": "4V9H+46G, SevenHills Health City, Marol Maroshi Road, Andheri East, Shivaji Nagar, Mumbai, Maharashtra 400059",
    "phone": "02267676767",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  },
  {
    "_id": {
      "$oid": "6849a9f557ece21e2cfd73ef"
    },
    "name": "Fortis S L Raheja Hospital",
    "location": {
      "type": "Point",
      "coordinates": [
        19.04823,
        72.84267
      ]
    },
    "address": "Raheja Rugnalaya Marg, Mahim West, Mahim, Mumbai, Maharashtra 400016",
    "phone": "02268846143",
    "hasAmbulance": true,
    "operatingHours": "24/7"
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Hospital.deleteMany({});
    console.log('Cleared existing hospital data');
    
    // Insert new data
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`Added ${createdHospitals.length} hospitals to the database`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();