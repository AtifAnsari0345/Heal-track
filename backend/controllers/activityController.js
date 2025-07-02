const Activity = require('../models/Activity');

// Get user's recent activities
exports.getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
};

// Add a new activity
exports.addActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      user: req.user.id,
      type: req.body.type,
      description: req.body.description,
      metadata: req.body.metadata || {}
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error adding activity' });
  }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activity.remove();
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity' });
  }
};

// Clear all activities for a user
exports.clearAllActivities = async (req, res) => {
  try {
    await Activity.deleteMany({ user: req.user.id });
    res.json({ message: 'All activities cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing activities' });
  }
};