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

  const [tagNumber, setTagNumber] = useState(`IND-9021-00${state.herd.length + 1}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-lg">
              🏷️
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Register New Animal to Herd</h3>
              <p className="text-xs text-slate-400">Step 3: Farm Livestock Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ear Tag Number</label>
              <input
                type="text"
                required
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Animal Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as AnimalType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Breed Description</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vaccination Status</label>
              <select
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="UP_TO_DATE">Up to Date</option>
                <option value="DUE_SOON">Due Soon</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Vaccination Date</label>
              <input
                type="date"
                value={lastVaccinationDate}
                onChange={(e) => setLastVaccinationDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Last Vaccine Administered</label>
            <input
              type="text"
              value={lastVaccineName}
              onChange={(e) => setLastVaccineName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Health & Treatment Notes</label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Animal to Registered Herd
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
