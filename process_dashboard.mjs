import fs from 'fs';

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
    `            {/* The primary color from the generated screen is #ec5b13. */}\n            <main>`,
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
            {children.length > 0 && activeChild && (
            <main>`
);

// 4. Transform hardcoded details
content = content.replace(/Aarav/g, '{activeChild.name}');
content = content.replace(`FOR {activeChild.name}`, `FOR {activeChild.name.toUpperCase()}`);
content = content.replace(`6 months old`, `{activeChild.dob ? 'DOB: ' + activeChild.dob : 'Newborn'}`);
// Ensure we handle the "10", "03", "01" stats correctly by finding the exact h3 tags
content = content.replace(
    `>10</h3>`,
    `>{activeChild.completed}</h3>`
);
content = content.replace(
    `>03</h3>`,
    `>{activeChild.upcoming}</h3>`
);
content = content.replace(
    `>01</h3>`,
    `>{activeChild.missed}</h3>`
);
// Progress
content = content.replace(
    `>70%</span>`,
    `>{activeChild.progress}%</span>`
);
content = content.replace(
    `style={{ width: "70%" }}`,
    `style={{ width: \`\${activeChild.progress}%\` }}`
);

// 5. Close the conditional block before the modal code
content = content.replace(
    `            {/* Add Child Modal */}`,
    `            )}
            
            {/* Add Child Modal */}`
);

// 6. Give <input name="xyz" /> to the modal inputs
content = content.replace(/Child's Full Name<\/label>\n\s*<input type="text"/, `Child's Full Name</label>\n                                <input type="text" name="fullName"`);
content = content.replace(/Date of Birth<\/label>\n\s*<input type="date"/, `Date of Birth</label>\n                                    <input type="date" name="dob"`);
content = content.replace(/Gender<\/label>\n\s*<select className="w-full/, `Gender</label>\n                                    <select name="gender" className="w-full`);
content = content.replace(/Blood Group<\/label>\n\s*<select className="w-full/, `Blood Group</label>\n                                <select name="bloodGroup" className="w-full`);


fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard refactoring done successfully.');
