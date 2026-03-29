import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Layers, Plus, ChevronRight, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

const Column = ({ title, items, selectedId, onSelect, nextType, canAdd, onAdd, onEdit, onDelete }) => {
    const [localInput, setLocalInput] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{items.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {items.length === 0 ? (
                    <div className="text-center p-4 text-sm text-gray-400">No {title.toLowerCase()} found.</div>
                ) : (
                    <ul className="space-y-1">
                        {items.map(item => (
                            <li
                                key={item._id}
                                onClick={() => onSelect && onSelect(item._id)}
                                className={`group p-3 rounded-lg cursor-pointer flex justify-between items-center transition ${selectedId === item._id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                            >
                                <span className="truncate pr-2">{item.name}</span>

                                <div className="flex items-center space-x-1 flex-shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-600 text-gray-500 hover:text-indigo-600 transition"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-600 text-gray-500 hover:text-red-500 transition"
                                        title="Delete"
                                        aria-label="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {nextType && <ChevronRight className="w-4 h-4 opacity-50 ml-1" />}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {canAdd && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={`New ${nextType || 'Section'}`}
                            className="flex-1 min-w-0 text-sm px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            onChange={(e) => setLocalInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && localInput.trim()) {
                                    onAdd(localInput.trim());
                                    setLocalInput('');
                                }
                            }}
                            value={localInput}
                        />
                        <button
                            onClick={() => {
                                if (localInput.trim()) {
                                    onAdd(localInput.trim());
                                    setLocalInput('');
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const InstitutionManager = () => {
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);

    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Modal States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: null, itemType: null, item: null });
    const [modaledName, setModaledName] = useState('');
    const [loading, setLoading] = useState(false);

    const config = () => {
        const { token } = JSON.parse(localStorage.getItem('userInfo')) || {};
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchColleges = async () => {
        const { data } = await axios.get('/api/institutions/colleges', config());
        setColleges(data);
    };

    const fetchDepartments = async (collegeId) => {
        const { data } = await axios.get(`/api/institutions/departments/${collegeId}`, config());
        setDepartments(data);
    };

    const fetchCourses = async (departmentId) => {
        const { data } = await axios.get(`/api/institutions/courses/${departmentId}`, config());
        setCourses(data);
    };

    const fetchSections = async (courseId) => {
        const { data } = await axios.get(`/api/institutions/sections/${courseId}`, config());
        setSections(data);
    };

    useEffect(() => { fetchColleges(); }, []);

    const fetchItemsByType = (type) => {
        if (type === 'college') fetchColleges();
        if (type === 'department' && selectedCollege) fetchDepartments(selectedCollege);
        if (type === 'course' && selectedDepartment) fetchCourses(selectedDepartment);
        if (type === 'section' && selectedCourse) fetchSections(selectedCourse);
    };

    const handleCreate = async (type, name) => {
        try {
            if (type === 'college') await axios.post('/api/institutions/colleges', { name }, config());
            else if (type === 'department') await axios.post('/api/institutions/departments', { name, college_id: selectedCollege }, config());
            else if (type === 'course') await axios.post('/api/institutions/courses', { name, department_id: selectedDepartment }, config());
            else if (type === 'section') await axios.post('/api/institutions/sections', { name, course_id: selectedCourse }, config());

            fetchItemsByType(type);
            toast.success(`${name} added!`);
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to add`);
        }
    };

    const handleEditSave = async () => {
        if (!modaledName.trim()) return;
        try {
            setLoading(true);
            await axios.put(`/api/institutions/${modalConfig.itemType}/${modalConfig.item._id}`, { name: modaledName }, config());
            fetchItemsByType(modalConfig.itemType);

            // In case we edited something that is currently selected, update its display implicitly by re-fetching
            if (modalConfig.itemType === 'college' && selectedCollege === modalConfig.item._id) fetchColleges();

            toast.success('Updated successfully');
            closeModal();
        } catch (err) {
            toast.error('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/institutions/${modalConfig.itemType}/${modalConfig.item._id}`, config());
            fetchItemsByType(modalConfig.itemType);

            // Clear selections if we deleted the selected item or its parent
            if (modalConfig.itemType === 'college' && selectedCollege === modalConfig.item._id) {
                setSelectedCollege(null); setDepartments([]); setCourses([]); setSections([]); setSelectedDepartment(null); setSelectedCourse(null);
            }
            if (modalConfig.itemType === 'department' && selectedDepartment === modalConfig.item._id) {
                setSelectedDepartment(null); setCourses([]); setSections([]); setSelectedCourse(null);
            }
            if (modalConfig.itemType === 'course' && selectedCourse === modalConfig.item._id) {
                setSelectedCourse(null); setSections([]);
            }

            toast.info('Deleted successfully');
            closeModal();
        } catch (err) {
            toast.error('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (itemType, item) => {
        setModaledName(item.name);
        setModalConfig({ isOpen: true, mode: 'edit', itemType, item });
    };

    const openDeleteModal = (itemType, item) => {
        setModalConfig({ isOpen: true, mode: 'delete', itemType, item });
    };

    const closeModal = () => setModalConfig({ isOpen: false, mode: null, itemType: null, item: null });

    return (
        <div className="space-y-6">
            <div className="flex items-center mb-8">
                <Layers className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institution Manager</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Configure Colleges, Departments, Courses & Sections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
                <Column
                    title="Colleges"
                    items={colleges}
                    selectedId={selectedCollege}
                    nextType="Department"
                    canAdd={true}
                    onAdd={(name) => handleCreate('college', name)}
                    onEdit={(item) => openEditModal('college', item)}
                    onDelete={(item) => openDeleteModal('college', item)}
                    onSelect={(id) => { setSelectedCollege(id); setDepartments([]); setCourses([]); setSections([]); setSelectedDepartment(null); setSelectedCourse(null); fetchDepartments(id); }}
                />
                <Column
                    title="Departments"
                    items={departments}
                    selectedId={selectedDepartment}
                    nextType="Course"
                    canAdd={!!selectedCollege}
                    onAdd={(name) => handleCreate('department', name)}
                    onEdit={(item) => openEditModal('department', item)}
                    onDelete={(item) => openDeleteModal('department', item)}
                    onSelect={(id) => { setSelectedDepartment(id); setCourses([]); setSections([]); setSelectedCourse(null); fetchCourses(id); }}
                />
                <Column
                    title="Courses"
                    items={courses}
                    selectedId={selectedCourse}
                    nextType="Section"
                    canAdd={!!selectedDepartment}
                    onAdd={(name) => handleCreate('course', name)}
                    onEdit={(item) => openEditModal('course', item)}
                    onDelete={(item) => openDeleteModal('course', item)}
                    onSelect={(id) => { setSelectedCourse(id); setSections([]); fetchSections(id); }}
                />
                <Column
                    title="Sections"
                    items={sections}
                    selectedId={null}
                    nextType={null}
                    canAdd={!!selectedCourse}
                    onAdd={(name) => handleCreate('section', name)}
                    onEdit={(item) => openEditModal('section', item)}
                    onDelete={(item) => openDeleteModal('section', item)}
                    onSelect={() => { }}
                />
            </div>

            {/* Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                                {modalConfig.mode === 'edit' ? <Pencil className="w-4 h-4 mr-2 text-indigo-600" /> : <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />}
                                {modalConfig.mode === 'edit' ? `Edit ${modalConfig.itemType}` : `Delete ${modalConfig.itemType}`}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {modalConfig.mode === 'edit' ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        value={modaledName}
                                        onChange={e => setModaledName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleEditSave}
                                        disabled={loading || !modaledName.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg text-sm leading-relaxed border border-red-100 dark:border-red-900/30">
                                        <p className="font-semibold mb-1">Warning: Destructive Action</p>
                                        <p>Are you sure you want to delete <strong>"{modalConfig.item?.name}"</strong>?</p>
                                        <p className="mt-2 text-xs opacity-90">This will also delete ALL associated {modalConfig.itemType === 'college' ? 'departments, courses, sections, and registered students' : modalConfig.itemType === 'department' ? 'courses, sections, and registered students' : modalConfig.itemType === 'course' ? 'sections and registered students' : 'registered students'} within it permanently.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            disabled={loading}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition disabled:bg-red-400 flex justify-center items-center"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Yes, Delete All'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionManager;
