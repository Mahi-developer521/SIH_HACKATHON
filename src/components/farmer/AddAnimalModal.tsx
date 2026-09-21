import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { AnimalType } from '../../types/surveillance';
import { X, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAnimalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, addAnimalToHerd } = useSurveillanceStore();

  const [tagNumber, setTagNumber] = useState(`IND-9021-00${(state.herd?.length || 0) + 1}`);
  const [species, setSpecies] = useState<AnimalType>('Cattle');
  const [breed, setBreed] = useState('Gir Indigenous Cow');
  const [ageYears, setAgeYears] = useState(3);
  const [vaccinationStatus, setVaccinationStatus] = useState<'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE'>('UP_TO_DATE');
  const [lastVaccineName, setLastVaccineName] = useState('FMD Oil Adjuvant Vaccine');
  const [lastVaccinationDate, setLastVaccinationDate] = useState('2026-04-10');
  const [treatment, setTreatment] = useState('Initial entry health screening passed; deworming scheduled.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnimalToHerd({
      tagNumber,
      species,
      breed,
      ageYears,
      vaccinationStatus,
      lastVaccineName,
      lastVaccinationDate,
      treatmentHistory: [treatment]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 text-base font-bold border border-blue-100">
              🏷️
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Animal to Herd</h3>
              <p className="text-xs text-slate-500">Step 3: Farm Livestock Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ear Tag Number</label>
              <input
                type="text"
                required
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="gov-input font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Animal Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as AnimalType)}
                className="gov-select font-medium text-slate-900"
              >
                <option value="Cattle">Cattle</option>
                <option value="Buffalo">Buffalo</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Poultry">Poultry</option>
                <option value="Pig">Pig</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Breed Description</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="gov-input text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="gov-input text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vaccination Status</label>
              <select
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus(e.target.value as any)}
                className="gov-select font-medium text-slate-900"
              >
                <option value="UP_TO_DATE">Up to Date</option>
                <option value="DUE_SOON">Due Soon</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Vaccination Date</label>
              <input
                type="date"
                value={lastVaccinationDate}
                onChange={(e) => setLastVaccinationDate(e.target.value)}
                className="gov-input text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Vaccine Administered</label>
            <input
              type="text"
              value={lastVaccineName}
              onChange={(e) => setLastVaccineName(e.target.value)}
              className="gov-input text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Health & Treatment Notes</label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="gov-input text-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="gov-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn-primary text-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Animal to Herd
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
