import User from '../models/User.js';

export const getSakha = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('sakha', 'username email');
    res.json(user.sakha || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addSakha = async (req, res) => {
  try {
    const friend = await User.findOne({ email: req.body.email });
    if (!friend) return res.status(404).json({ error: 'User not found' });
    const user = await User.findById(req.user.id);
    if (!user.sakha.includes(friend._id)) {
      user.sakha.push(friend._id);
      await user.save();
    }
    res.json(user.sakha);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeSakha = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.sakha = user.sakha.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json(user.sakha);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchPeople = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: req.query.q, $options: 'i' } },
        { email: { $regex: req.query.q, $options: 'i' } }
      ]
    }, 'username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
