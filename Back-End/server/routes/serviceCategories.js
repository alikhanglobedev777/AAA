const express = require('express');
const router = express.Router();
const ServiceCategory = require('../models/ServiceCategory');

// const redisCache = require('../config/redis'); // Temporarily disabled





// GET /api/service-categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    const { search, featured, parent, limit = 100 } = req.query;
    
    // Cache temporarily disabled for stability

    let query = { isActive: true, approvalStatus: 'approved' };
    
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (parent) {
      if (parent === 'null') {
        query.parentCategory = null;
      } else {
        query.parentCategory = parent;
      }
    }

    const categories = await ServiceCategory.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subCategories', 'name slug businessCount')
      .sort({ sortOrder: 1, name: 1 })
      .limit(parseInt(limit))
      .lean();

    const Business = require('../models/Business');
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const businessTypeMap = {
          'plumbing-services': 'plumbing',
          'electrical-services': 'electrical',
          'cleaning-services': 'cleaning',
          'painting-services': 'painting',
          'gardening-landscaping': 'gardening',
          'repair-maintenance': 'repair',
          'transport-services': 'transport',
          'security-services': 'security',
          'education-training': 'education',
          'food-catering': 'food',
          'beauty-personal-care': 'beauty',
          'health-medical': 'health',
          'construction-services': 'construction',
          'maintenance-services': 'maintenance',
          'automotive-services': 'automotive',
          'pet-services': 'other',
          'pest-control': 'other',
          'it-technology': 'other',
          'business-services': 'other',
          'other-services': 'other'
        };

        const businessType = businessTypeMap[category.slug] || 'other';
        
        // Count active businesses for this category using both businessType and serviceCategory
        const businessCount = await Business.countDocuments({
          $or: [
            { businessType: businessType, status: 'active' },
            { 'serviceCategory.slug': category.slug, status: 'active' }
          ]
        });

        return {
          ...category,
          businessCount: businessCount
        };
      })
    );

    const result = {
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length,
      search: search || null,
      featured: featured === 'true',
      parent: parent || null
    };

    // Cache temporarily disabled for stability

    res.json(result);

  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      message: 'Server error while fetching service categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/service-categories/tree - Get category tree structure
router.get('/tree', async (req, res) => {
  try {
    // Cache temporarily disabled for stability

    const tree = await ServiceCategory.getCategoryTree();
    
    const result = {
      tree,
      total: tree.length
    };

    // Cache temporarily disabled for stability

    res.json(result);

  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      message: 'Server error while fetching category tree',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/service-categories/featured - Get featured categories
router.get('/featured', async (req, res) => {
  try {
    // Cache temporarily disabled for stability

    const categories = await ServiceCategory.findFeatured()
      .populate('subCategories', 'name slug businessCount')
      .lean();

    const result = {
      categories,
      total: categories.length
    };

    // Cache temporarily disabled for stability

    res.json(result);

  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({
      message: 'Server error while fetching featured categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/service-categories/:id - Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      category = await ServiceCategory.findById(id)
        .populate('parentCategory', 'name slug')
        .populate('subCategories', 'name slug businessCount')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName');
    } else {
      // Slug
      category = await ServiceCategory.findOne({ slug: id })
        .populate('parentCategory', 'name slug')
        .populate('subCategories', 'name slug businessCount')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName');
    }

    if (!category) {
      return res.status(404).json({
        message: 'Service category not found',
        error: 'The requested category does not exist'
      });
    }

    if (!category.isActive || category.approvalStatus !== 'approved') {
      return res.status(404).json({
        message: 'Category not available',
        error: 'This category is not currently available'
      });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get service category error:', error);
    res.status(500).json({
      message: 'Server error while fetching service category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});









module.exports = router;
