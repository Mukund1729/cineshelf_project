import Pick from '../models/Pick.js';
import List from '../models/List.js';

// Sample data for cinematic picks (in production, this would come from database)
const samplePicks = [
  {
    _id: '1',
    title: 'Visual Masterpieces',
    description: 'Films that redefine cinematography and visual storytelling',
    type: 'visual',
    image: '/api/placeholder/visual-masterpieces.jpg',
    movies: ['2001: A Space Odyssey', 'Blade Runner', 'The Grand Budapest Hotel'],
    featured: true
  },
  {
    _id: '2',
    title: 'Editor\'s Choice 2024',
    description: 'Our top picks for the most compelling films of the year',
    type: 'editor',
    image: '/api/placeholder/editors-choice.jpg',
    movies: ['Poor Things', 'The Zone of Interest', 'Anatomy of a Fall'],
    featured: true
  },
  {
    _id: '3',
    title: '90s Cinema Revolution',
    description: 'The decade that changed independent filmmaking forever',
    type: 'decade',
    image: '/api/placeholder/90s-cinema.jpg',
    movies: ['Pulp Fiction', 'Fargo', 'The Big Lebowski'],
    featured: false
  },
  {
    _id: '4',
    title: 'Christopher Nolan Collection',
    description: 'Exploring the mind-bending narratives of a modern master',
    type: 'director',
    image: '/api/placeholder/nolan.jpg',
    movies: ['Inception', 'Memento', 'Interstellar'],
    featured: true
  }
];

// Get all picks
export const getAllPicks = async (req, res) => {
  try {
    // For now, return sample data. In production, fetch from database
    res.json(samplePicks);
  } catch (error) {
    console.error('Get all picks error:', error);
    res.status(500).json({ error: 'Failed to fetch picks' });
  }
};

// Get picks by type
export const getPicksByType = async (req, res) => {
  try {
    const { type } = req.params;
    const filteredPicks = samplePicks.filter(pick => pick.type === type);
    res.json(filteredPicks);
  } catch (error) {
    console.error('Get picks by type error:', error);
    res.status(500).json({ error: 'Failed to fetch picks by type' });
  }
};

// Get community lists
export const getCommunityLists = async (req, res) => {
  try {
    // In production, fetch from database
    const communityLists = [
      {
        _id: '1',
        title: 'Hidden Gems',
        description: 'Underrated films that deserve more attention',
        creator: 'cinephile_user',
        movies: ['Moon', 'Coherence', 'The Man from Earth'],
        likes: 42
      },
      {
        _id: '2',
        title: 'Perfect Sunday Movies',
        description: 'Comfort films for lazy weekend afternoons',
        creator: 'movie_lover',
        movies: ['The Princess Bride', 'Big Fish', 'Amélie'],
        likes: 38
      }
    ];
    res.json(communityLists);
  } catch (error) {
    console.error('Get community lists error:', error);
    res.status(500).json({ error: 'Failed to fetch community lists' });
  }
};

// Get director spotlights
export const getDirectorSpotlights = async (req, res) => {
  try {
    const directorSpotlights = [
      {
        _id: '1',
        name: 'Christopher Nolan',
        description: 'Master of mind-bending narratives and practical effects',
        image: '/api/placeholder/nolan.jpg',
        films: ['Inception', 'Memento', 'Interstellar', 'Dunkirk'],
        style: 'Non-linear storytelling, practical effects, complex narratives'
      },
      {
        _id: '2',
        name: 'Wes Anderson',
        description: 'The king of symmetrical compositions and quirky characters',
        image: '/api/placeholder/anderson.jpg',
        films: ['The Grand Budapest Hotel', 'Moonrise Kingdom', 'Fantastic Mr. Fox'],
        style: 'Symmetrical compositions, pastel color palettes, ensemble casts'
      },
      {
        _id: '3',
        name: 'Denis Villeneuve',
        description: 'Modern master of atmospheric sci-fi and psychological thrillers',
        image: '/api/placeholder/villeneuve.jpg',
        films: ['Arrival', 'Blade Runner 2049', 'Dune'],
        style: 'Atmospheric cinematography, slow-burn narratives, sci-fi themes'
      }
    ];
    res.json(directorSpotlights);
  } catch (error) {
    console.error('Get director spotlights error:', error);
    res.status(500).json({ error: 'Failed to fetch director spotlights' });
  }
};

// Create a new pick (admin only)
export const createPick = async (req, res) => {
  try {
    const { title, description, type, image, movies, featured } = req.body;
    
    // In production, save to database
    const newPick = {
      _id: Date.now().toString(),
      title,
      description,
      type,
      image,
      movies,
      featured: featured || false,
      createdAt: new Date()
    };
    
    res.status(201).json(newPick);
  } catch (error) {
    console.error('Create pick error:', error);
    res.status(500).json({ error: 'Failed to create pick' });
  }
};

// Update a pick (admin only)
export const updatePick = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // In production, update in database
    const updatedPick = { ...updates, _id: id, updatedAt: new Date() };
    res.json(updatedPick);
  } catch (error) {
    console.error('Update pick error:', error);
    res.status(500).json({ error: 'Failed to update pick' });
  }
};

// Delete a pick (admin only)
export const deletePick = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, delete from database
    res.json({ message: 'Pick deleted successfully' });
  } catch (error) {
    console.error('Delete pick error:', error);
    res.status(500).json({ error: 'Failed to delete pick' });
  }
}; 