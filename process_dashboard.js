const fs = require('fs');

const file = 'src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add children state
content = content.replace(
    'const [showAddModal, setShowAddModal] = useState(false);',
    `const [children, setChildren] = useState([]);
    const [activeChildIndex, setActiveChildIndex] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const handleAddChild = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('fullName');
        
        const newChild = {
            id: Date.now(),
            name: name,
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            bloodGroup: formData.get('bloodGroup'),
            // Setting placeholder values
            progress: 0,
            completed: 0,
            upcoming: 0,
            missed: 0,
            vaccines: []
        };
        
        const newChildren = [...children, newChild];
        setChildren(newChildren);
        setActiveChildIndex(newChildren.length - 1);
        setShowAddModal(false);
    };

    const activeChild = children[activeChildIndex];`
);

// 2. Change modal form onSubmit
content = content.replace(
    `onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}`,
    `onSubmit={handleAddChild}`
);

// 3. Add Empty State
content = content.replace(
    `            {/* The primary color from the generated screen is #ec5b13. */}`,
    `            {/* Empty State */}
            {children.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-lg border border-slate-200 dark:border-slate-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="size-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
                            <span className="material-symbols-outlined text-4xl">child_care</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Welcome to VaxiCare</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm md:text-base">Get started by adding your child's profile. We will automatically generate their vaccination schedule based on their date of birth.</p>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mx-auto w-full md:w-auto"
                        >
                            <span className="material-symbols-outlined font-bold">add_circle</span>
                            Add Child Profile
                        </button>
                    </div>
                </div>
            )}
            
            {/* Dashboard Content */}
            {children.length > 0 && (`
);

// 4. Change specific hardcoded strings
// "Aarav" -> "{activeChild.name}"
content = content.replace(/Aarav/g, '{activeChild.name}');
// "FOR {activeChild.name}" -> "FOR {activeChild.name.toUpperCase()}"
content = content.replace(
    `FOR {activeChild.name}`,
    `FOR {activeChild.name.toUpperCase()}`
);
// "6 months old" -> "{activeChild.dob ? 'Registered' : 'Newborn'}" (for now)
content = content.replace(
    `6 months old`,
    `{activeChild.dob}`
);
// "10" -> "{activeChild.completed}"
content = content.replace(
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">10</h3>`,
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.completed}</h3>`
);
// "03" -> "{activeChild.upcoming}"
content = content.replace(
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">03</h3>`,
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.upcoming}</h3>`
);
// "01" -> "{activeChild.missed}"
content = content.replace(
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">01</h3>`,
    `<h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.missed}</h3>`
);

// 5. Add closing parenthesis around dashboard content block at the very end
// Find the last </div> before Modal code
content = content.replace(
    `            {/* Add Child Modal */}`,
    `            )}
            
            {/* Add Child Modal */}`
);

// 6. Give <input name="xyz" /> to the modal
content = content.replace(/Child's Full Name<\/label>\n\s*<input type="text"/, `Child's Full Name</label>\n                                <input type="text" name="fullName"`);
content = content.replace(/Date of Birth<\/label>\n\s*<input type="date"/, `Date of Birth</label>\n                                    <input type="date" name="dob"`);
content = content.replace(/Gender<\/label>\n\s*<select className="w-full/, `Gender</label>\n                                    <select name="gender" className="w-full`);
content = content.replace(/Blood Group<\/label>\n\s*<select className="w-full/, `Blood Group</label>\n                                <select name="bloodGroup" className="w-full`);

fs.writeFileSync(file, content, 'utf8');
console.log('Done refactoring Dashboard.jsx');
