const db = require('../db');

let memoryAnimals = [
  {
    id: 'ANM-01',
    tagNumber: 'IND-9021-001',
    species: 'Cattle',
    breed: 'Gir Cow',
    ageYears: 4,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-03-15',
    lastVaccineName: 'FMD Oil Adjuvant Vaccine',
    treatmentHistory: ['Routine deworming (Feb 2026)', 'Mastitis treatment (Nov 2025)']
  },
  {
    id: 'ANM-02',
    tagNumber: 'IND-9021-002',
    species: 'Cattle',
    breed: 'Sahiwal Cross',
    ageYears: 3,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-03-15',
    lastVaccineName: 'FMD Oil Adjuvant Vaccine',
    treatmentHistory: ['Calcium deficiency supplement (Jan 2026)']
  },
  {
    id: 'ANM-03',
    tagNumber: 'IND-9021-003',
    species: 'Cattle',
    breed: 'HF Cross',
    ageYears: 5,
    vaccinationStatus: 'DUE_SOON',
    lastVaccinationDate: '2025-10-10',
    lastVaccineName: 'HS + BQ Combined Vaccine',
    treatmentHistory: ['Minor hoof trim (Dec 2025)']
  },
  {
    id: 'ANM-04',
    tagNumber: 'IND-9021-004',
    species: 'Buffalo',
    breed: 'Murrah',
    ageYears: 6,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-02-20',
    lastVaccineName: 'FMD Vaccine',
    treatmentHistory: ['Annual health check passed']
  }
];

async function getAnimals(req, res, next) {
  try {
    if (db.isPostgresConnected()) {
      const query = `
        SELECT 
          id,
          tag_number AS "tagNumber",
          species,
          breed,
          age_years AS "ageYears",
          vaccination_status AS "vaccinationStatus",
          TO_CHAR(last_vaccination_date, 'YYYY-MM-DD') AS "lastVaccinationDate",
          last_vaccine_name AS "lastVaccineName",
          treatment_history AS "treatmentHistory"
        FROM animals
        ORDER BY id ASC;
      `;
      const result = await db.query(query);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    res.json({ success: true, count: memoryAnimals.length, data: memoryAnimals });
  } catch (err) {
    next(err);
  }
}

async function createAnimal(req, res, next) {
  const {
    farmerId = 'FARMER-01',
    tagNumber,
    species,
    breed,
    ageYears = 3,
    vaccinationStatus = 'UP_TO_DATE',
    lastVaccinationDate,
    lastVaccineName,
    treatmentHistory = []
  } = req.body;

  try {
    if (!tagNumber || !species || !breed) {
      return res.status(400).json({ success: false, error: 'tagNumber, species, and breed are required' });
    }

    const animalId = `ANM-0${memoryAnimals.length + 1}`;
    const newAnimal = {
      id: animalId,
      tagNumber,
      species,
      breed,
      ageYears: Number(ageYears),
      vaccinationStatus,
      lastVaccinationDate: lastVaccinationDate || new Date().toISOString().substring(0, 10),
      lastVaccineName: lastVaccineName || 'FMD Vaccine',
      treatmentHistory: Array.isArray(treatmentHistory) ? treatmentHistory : [treatmentHistory]
    };

    if (db.isPostgresConnected()) {
      const insertQuery = `
        INSERT INTO animals (
          id, farmer_id, tag_number, species, breed, age_years,
          vaccination_status, last_vaccination_date, last_vaccine_name, treatment_history
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      await db.query(insertQuery, [
        animalId, farmerId, tagNumber, species, breed, newAnimal.ageYears,
        vaccinationStatus, newAnimal.lastVaccinationDate, newAnimal.lastVaccineName, newAnimal.treatmentHistory
      ]);
    } else {
      memoryAnimals.unshift(newAnimal);
    }

    res.status(201).json({
      success: true,
      message: `Animal ${tagNumber} registered successfully`,
      data: newAnimal
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnimals,
  createAnimal
};
