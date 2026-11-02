const Training = require('../models/Training');

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
exports.getAllTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.$or = [{ department }, { department: 'All Departments' }];
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email role')
      .populate('enrolledEmployees', 'name email department designation')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving trainings',
    });
  }
};

// @desc    Get single training program
// @route   GET /api/trainings/:id
// @access  Private
exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('enrolledEmployees', 'name email department designation');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    res.json({
      success: true,
      data: training,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving training program',
    });
  }
};

// @desc    Create new training program (HR & Manager)
// @route   POST /api/trainings
// @access  Private (HR & Manager)
exports.createTraining = async (req, res) => {
  try {
    const { title, description, trainer, startDate, endDate, department, capacity } = req.body;

    const training = await Training.create({
      title,
      description,
      trainer,
      startDate,
      endDate,
      department: department || 'All Departments',
      capacity: capacity ? Number(capacity) : 30,
      createdBy: req.user._id,
      status: 'Upcoming',
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error creating training',
    });
  }
};

// @desc    Update training program (HR & Manager)
// @route   PUT /api/trainings/:id
// @access  Private (HR & Manager)
exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Training program updated successfully',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating training',
    });
  }
};

// @desc    Delete training program (HR & Manager)
// @route   DELETE /api/trainings/:id
// @access  Private (HR & Manager)
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Training program deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting training',
    });
  }
};

// @desc    Enroll or unenroll employee in training
// @route   POST /api/trainings/:id/enroll
// @access  Private (Employees & Managers)
exports.toggleEnrollment = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const userId = req.user._id.toString();
    const isEnrolled = training.enrolledEmployees.some(e => e.toString() === userId);

    if (isEnrolled) {
      training.enrolledEmployees = training.enrolledEmployees.filter(e => e.toString() !== userId);
      await training.save();
      return res.json({
        success: true,
        message: 'Successfully unregistered from training program',
        isEnrolled: false,
        enrolledCount: training.enrolledEmployees.length,
      });
    } else {
      if (training.enrolledEmployees.length >= training.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Training program has reached maximum participant capacity.',
        });
      }

      training.enrolledEmployees.push(req.user._id);
      await training.save();
      return res.json({
        success: true,
        message: 'Successfully enrolled in training program',
        isEnrolled: true,
        enrolledCount: training.enrolledEmployees.length,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error toggling enrollment',
    });
  }
};
