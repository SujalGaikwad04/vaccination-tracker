export const INDIA_VACCINE_SCHEDULE = [
    {
        id: 'BCG',
        name: 'BCG',
        fullForm: 'Bacillus Calmette-Guérin',
        when: 'At birth',
        offsetDays: 0,
        impact: 'Protects from TB',
        reason: 'Prevents severe TB',
        ifMissed: 'TB → Lung damage, brain TB, death'
    },
    {
        id: 'OPV-0',
        name: 'OPV-0',
        fullForm: 'Oral Polio Vaccine',
        when: 'At birth',
        offsetDays: 0,
        impact: 'Early polio immunity',
        reason: 'Prevent paralysis',
        ifMissed: 'Polio → Permanent disability'
    },
    {
        id: 'HepB-Birth',
        name: 'Hep B (Birth)',
        fullForm: 'Hepatitis B Vaccine',
        when: 'Within 24 hrs',
        offsetDays: 0,
        impact: 'Protects liver',
        reason: 'Prevent liver disease',
        ifMissed: 'Hepatitis B → Liver failure, cancer'
    },
    {
        id: 'OPV-1',
        name: 'OPV-1',
        fullForm: 'Oral Polio Vaccine',
        when: '6 weeks',
        offsetDays: 42,
        impact: 'Polio protection',
        reason: 'Avoid paralysis',
        ifMissed: 'Polio → Cannot walk'
    },
    {
        id: 'Pentavalent-1',
        name: 'Pentavalent-1',
        fullForm: 'DPT+HepB+Hib',
        when: '6 weeks',
        offsetDays: 42,
        impact: '5 disease protection',
        reason: 'Prevent infections',
        ifMissed: 'Diphtheria, Tetanus, Hep B → Breathing failure, liver damage'
    },
    {
        id: 'fIPV-1',
        name: 'fIPV-1',
        fullForm: 'Inactivated Polio Vaccine',
        when: '6 weeks',
        offsetDays: 42,
        impact: 'Strong immunity',
        reason: 'Extra safety',
        ifMissed: 'Polio → Weak immunity'
    },
    {
        id: 'RVV-1',
        name: 'RVV-1',
        fullForm: 'Rotavirus Vaccine',
        when: '6 weeks',
        offsetDays: 42,
        impact: 'Prevent diarrhea',
        reason: 'Stop dehydration',
        ifMissed: 'Severe Diarrhea → Death risk'
    },
    {
        id: 'PCV-1',
        name: 'PCV-1',
        fullForm: 'Pneumococcal Vaccine',
        when: '6 weeks',
        offsetDays: 42,
        impact: 'Lung protection',
        reason: 'Prevent pneumonia',
        ifMissed: 'Pneumonia → Hospitalization'
    },
    {
        id: 'OPV-2',
        name: 'OPV-2',
        fullForm: 'Oral Polio Vaccine',
        when: '10 weeks',
        offsetDays: 70,
        impact: 'More immunity',
        reason: 'Continue protection',
        ifMissed: 'Polio → Paralysis'
    },
    {
        id: 'Pentavalent-2',
        name: 'Pentavalent-2',
        fullForm: 'DPT+HepB+Hib',
        when: '10 weeks',
        offsetDays: 70,
        impact: 'Boost immunity',
        reason: 'Complete course',
        ifMissed: 'Whooping Cough → Brain damage'
    },
    {
        id: 'RVV-2',
        name: 'RVV-2',
        fullForm: 'Rotavirus Vaccine',
        when: '10 weeks',
        offsetDays: 70,
        impact: 'Diarrhea protection',
        reason: 'Life saving',
        ifMissed: 'Dehydration → ICU needed'
    },
    {
        id: 'OPV-3',
        name: 'OPV-3',
        fullForm: 'Oral Polio Vaccine',
        when: '14 weeks',
        offsetDays: 98,
        impact: 'Full protection',
        reason: 'Eradicate polio',
        ifMissed: 'Polio → Lifetime disability'
    },
    {
        id: 'Pentavalent-3',
        name: 'Pentavalent-3',
        fullForm: 'DPT+HepB+Hib',
        when: '14 weeks',
        offsetDays: 98,
        impact: 'Strong immunity',
        reason: 'Final dose',
        ifMissed: 'Tetanus, Hep B → Death risk'
    },
    {
        id: 'fIPV-2',
        name: 'fIPV-2',
        fullForm: 'Polio Injection',
        when: '14 weeks',
        offsetDays: 98,
        impact: 'Long immunity',
        reason: 'Extra safety',
        ifMissed: 'Polio → Weak defense'
    },
    {
        id: 'RVV-3',
        name: 'RVV-3',
        fullForm: 'Rotavirus Vaccine',
        when: '14 weeks',
        offsetDays: 98,
        impact: 'Diarrhea prevention',
        reason: 'Prevent death',
        ifMissed: 'Severe diarrhea → Malnutrition'
    },
    {
        id: 'PCV-2',
        name: 'PCV-2',
        fullForm: 'Pneumococcal',
        when: '14 weeks',
        offsetDays: 98,
        impact: 'Lung strength',
        reason: 'Prevent infection',
        ifMissed: 'Meningitis → Brain damage'
    },
    {
        id: 'MR-1',
        name: 'MR-1',
        fullForm: 'Measles-Rubella',
        when: '9 months',
        offsetDays: 274, // ~9 months
        impact: 'Virus protection',
        reason: 'Prevent outbreaks',
        ifMissed: 'Measles → Blindness, brain swelling'
    },
    {
        id: 'JE-1',
        name: 'JE-1',
        fullForm: 'Japanese Encephalitis',
        when: '9 months',
        offsetDays: 274,
        impact: 'Brain safety',
        reason: 'Avoid coma',
        ifMissed: 'JE → Mental disability'
    },
    {
        id: 'PCV-Booster',
        name: 'PCV Booster',
        fullForm: 'Pneumococcal Booster',
        when: '9-12 months',
        offsetDays: 274,
        impact: 'Long immunity',
        reason: 'Strong lungs',
        ifMissed: 'Pneumonia → ICU admission'
    },
    {
        id: 'DPT-Booster-1',
        name: 'DPT Booster-1',
        fullForm: 'Diphtheria-Pertussis-Tetanus',
        when: '16-24 months',
        offsetDays: 487, // ~16 months
        impact: 'Boost immunity',
        reason: 'Prevent relapse',
        ifMissed: 'Diphtheria → Heart failure'
    },
    {
        id: 'OPV-Booster',
        name: 'OPV Booster',
        fullForm: 'Polio Booster',
        when: '16-24 months',
        offsetDays: 487,
        impact: 'Lifetime safety',
        reason: 'Polio free',
        ifMissed: 'Polio → Return risk'
    },
    {
        id: 'MR-2',
        name: 'MR-2',
        fullForm: 'Measles-Rubella',
        when: '16-24 months',
        offsetDays: 487,
        impact: 'Long protection',
        reason: 'Avoid outbreaks',
        ifMissed: 'Measles → Death'
    },
    {
        id: 'JE-2',
        name: 'JE-2',
        fullForm: 'Japanese Encephalitis',
        when: '16-24 months',
        offsetDays: 487,
        impact: 'Brain protection',
        reason: 'Endemic safety',
        ifMissed: 'JE → Coma'
    },
    {
        id: 'DPT-Booster-2',
        name: 'DPT Booster-2',
        fullForm: 'Diphtheria-Pertussis-Tetanus',
        when: '5-6 years',
        offsetDays: 1826, // ~5 years
        impact: 'Continued protection',
        reason: 'Avoid infections',
        ifMissed: 'Tetanus → Lockjaw, death'
    },
    {
        id: 'Td-1',
        name: 'Td (10 Yrs)',
        fullForm: 'Tetanus-Diphtheria',
        when: '10 years',
        offsetDays: 3652, // ~10 years
        impact: 'Prevents tetanus',
        reason: 'Wound protection',
        ifMissed: 'Tetanus → Breathing failure'
    },
    {
        id: 'Td-2',
        name: 'Td (16 Yrs)',
        fullForm: 'Tetanus-Diphtheria',
        when: '16 years',
        offsetDays: 5844, // ~16 years
        impact: 'Prevents tetanus',
        reason: 'Wound protection',
        ifMissed: 'Tetanus → Breathing failure'
    }
];

export const generateVaccineSchedule = (dobString) => {
    if (!dobString) return [];

    // Parse DOB
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return [];

    return INDIA_VACCINE_SCHEDULE.map(vaccine => {
        // Calculate due date based on offset days
        const dueDate = new Date(dob);
        dueDate.setDate(dueDate.getDate() + vaccine.offsetDays);

        // Determine status based on current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Let's create a grace period of 7 days before it's "missed" (except for newborn maybe)
        const missedDate = new Date(dueDate);
        missedDate.setDate(missedDate.getDate() + 14); // 2 weeks grace period

        let status = 'upcoming';

        if (today > missedDate) {
            status = 'missed';
        } else if (today >= dueDate && today <= missedDate) {
            status = 'due';
        }

        return {
            ...vaccine,
            dueDate: dueDate.toISOString().split('T')[0], // YYYY-MM-DD format
            status: status
        };
    });
};
