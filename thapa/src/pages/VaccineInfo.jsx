import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INDIA_VACCINE_SCHEDULE } from '../utils/vaccinationData';

// Map of extended info and images
const VACCINE_DETAILS = {
  'BCG': { image: 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&q=80', description: 'BCG vaccine (Bacillus Calmette-Guérin) is primarily used against tuberculosis (TB). In countries where tuberculosis or leprosy is common, one dose is recommended in healthy babies as close to the time of birth as possible.' },
  'OPV-0': { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80', description: 'Oral poliovirus vaccines (OPV) are the predominant vaccine used in the fight to eradicate polio. There are different types of oral poliovirus vaccine, which may contain one, a combination of two, or all three different serotypes of attenuated vaccine.' },
  'OPV-1': { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80', description: 'Oral poliovirus vaccines (OPV) are the predominant vaccine used in the fight to eradicate polio. This is the first regular dose given at 6 weeks.' },
  'HepB-Birth': { image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80', description: 'Hepatitis B vaccine is a vaccine that prevents hepatitis B. The first dose is recommended within 24 hours of birth with either two or three more doses given after that.' },
  'Pentavalent-1': { image: 'https://images.unsplash.com/photo-1618015359908-7fba1fc80c35?auto=format&fit=crop&q=80', description: 'Pentavalent vaccine protects against five major diseases: diphtheria, tetanus, pertussis (whooping cough), hepatitis B and Haemophilus influenzae type b (Hib).' }
};

const VaccineInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find base data in schedule
    const baseData = INDIA_VACCINE_SCHEDULE.find(v => v.id === id || v.name === id);
    const extraData = VACCINE_DETAILS[id] || { 
        image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80', 
        description: 'Detailed public health information for this vaccine is currently being reviewed. Please consult with your pediatrician for specific guidance regarding this immunization.'
    };

    if (!baseData) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display dark:text-white bg-slate-50 dark:bg-slate-900">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Vaccine information not found.</h2>
                    <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-display text-slate-900 dark:text-slate-100 p-6 md:p-12">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-indigo-600 font-bold hover:underline bg-indigo-50 dark:bg-slate-800 px-4 py-2 border border-indigo-100 dark:border-slate-700 rounded-full w-fit transition-colors hover:bg-indigo-100 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Go Back
            </button>
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-64 sm:h-80 w-full relative">
                    <img src={extraData.image} alt={baseData.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end">
                        <div className="p-8">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{baseData.name}</h1>
                            <p className="text-xl text-indigo-200 font-bold mt-2">{baseData.fullForm}</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 sm:p-12 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-indigo-500">info</span>
                            About this Vaccine
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {extraData.description}
                        </p>
                    </section>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-indigo-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">calendar_month</span>
                                Recommended Schedule
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">Given at: <span className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">{baseData.when}</span></p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">verified_user</span>
                                Key Impact
                            </h3>
                            <p className="text-emerald-800 dark:text-emerald-300 font-bold text-lg">{baseData.impact}</p>
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1">{baseData.reason}</p>
                        </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-center">
                        <span className="material-symbols-outlined text-rose-500 text-5xl mb-2">warning</span>
                        <h3 className="font-bold text-rose-900 dark:text-rose-200 mb-2 text-xl">
                            Risks of Missing
                        </h3>
                        <p className="text-rose-700 dark:text-rose-300 font-bold text-lg">{baseData.ifMissed}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default VaccineInfo;
