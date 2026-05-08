import Student from '../models/Student.js';
import User from '../models/User.js';

export const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, grade, medicalInfo, emergencyContact } = req.body;
    const parentId = req.user.id;

    const student = await Student.create({
      firstName, lastName, parent: parentId, dateOfBirth, grade, medicalInfo, emergencyContact
    });

    await User.findByIdAndUpdate(parentId, {
      $push: { 'profile.parent.children': student._id }
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('Error creando estudiante:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const students = await Student.find({ parent: req.user.id });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const students = await Student.find()
      .populate('parent', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Student.countDocuments();
    res.status(200).json({ success: true, data: students, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    if (student.parent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('Error actualizando estudiante:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    await User.findByIdAndUpdate(student.parent, {
      $pull: { 'profile.parent.children': student._id }
    });
    res.status(200).json({ success: true, message: 'Estudiante eliminado' });
  } catch (error) {
    console.error('Error eliminando estudiante:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

export default {
  createStudent, getMyStudents, getAllStudents, getStudentById, updateStudent, deleteStudent
};