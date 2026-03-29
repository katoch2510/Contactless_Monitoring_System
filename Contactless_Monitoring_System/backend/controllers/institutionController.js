import College from '../models/College.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Section from '../models/Section.js';

// @desc    Get all colleges
// @route   GET /api/institutions/colleges
export const getColleges = async (req, res) => {
    const data = await College.find({});
    res.json(data);
};

// @desc    Get departments by college
// @route   GET /api/institutions/departments/:collegeId
export const getDepartments = async (req, res) => {
    const data = await Department.find({ college_id: req.params.collegeId });
    res.json(data);
};

// @desc    Get courses by department
// @route   GET /api/institutions/courses/:departmentId
export const getCourses = async (req, res) => {
    const data = await Course.find({ department_id: req.params.departmentId });
    res.json(data);
};

// @desc    Get sections by course
// @route   GET /api/institutions/sections/:courseId
export const getSections = async (req, res) => {
    const data = await Section.find({ course_id: req.params.courseId });
    res.json(data);
};

// @desc    Create College
// @route   POST /api/institutions/colleges
export const createCollege = async (req, res) => {
    const item = await College.create({ name: req.body.name });
    res.status(201).json(item);
};

// @desc    Create Department
// @route   POST /api/institutions/departments
export const createDepartment = async (req, res) => {
    const { name, college_id } = req.body;
    const item = await Department.create({ name, college_id });
    res.status(201).json(item);
};

// @desc    Create Course
// @route   POST /api/institutions/courses
export const createCourse = async (req, res) => {
    const { name, department_id } = req.body;
    const item = await Course.create({ name, department_id });
    res.status(201).json(item);
};

// @desc    Create Section
// @route   POST /api/institutions/sections
export const createSection = async (req, res) => {
    const { name, course_id } = req.body;
    const item = await Section.create({ name, course_id });
    res.status(201).json(item);
};

// @desc    Edit Institution
// @route   PUT /api/institutions/:type/:id
export const editInstitution = async (req, res) => {
    const { type, id } = req.params;
    const { name } = req.body;
    let Model;
    if (type === 'college') Model = College;
    else if (type === 'department') Model = Department;
    else if (type === 'course') Model = Course;
    else if (type === 'section') Model = Section;

    if (!Model) return res.status(400).json({ message: 'Invalid type' });
    const item = await Model.findByIdAndUpdate(id, { name }, { new: true });
    res.json(item);
};

// @desc    Delete Institution & Cascade
// @route   DELETE /api/institutions/:type/:id
export const deleteInstitution = async (req, res) => {
    const { type, id } = req.params;
    // We import Student to handle cascade deletion
    // A bit hacky here because we can't top-level import without risking circular deps or restructuring, but since we are at controller layer it's fine.
    const Student = (await import('../models/Student.js')).default;

    try {
        if (type === 'college') {
            await College.findByIdAndDelete(id);
            const depts = await Department.find({ college_id: id });
            for (let d of depts) {
                const courses = await Course.find({ department_id: d._id });
                for (let c of courses) {
                    await Section.deleteMany({ course_id: c._id });
                }
                await Course.deleteMany({ department_id: d._id });
            }
            await Department.deleteMany({ college_id: id });
            await Student.deleteMany({ college: id });
        } else if (type === 'department') {
            await Department.findByIdAndDelete(id);
            const courses = await Course.find({ department_id: id });
            for (let c of courses) {
                await Section.deleteMany({ course_id: c._id });
            }
            await Course.deleteMany({ department_id: id });
            await Student.deleteMany({ department: id });
        } else if (type === 'course') {
            await Course.findByIdAndDelete(id);
            await Section.deleteMany({ course_id: id });
            await Student.deleteMany({ course: id });
        } else if (type === 'section') {
            await Section.findByIdAndDelete(id);
            await Student.deleteMany({ section: id });
        } else {
            return res.status(400).json({ message: 'Invalid type' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during deletion' });
    }
};
