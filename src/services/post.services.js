const jwt = require('jsonwebtoken');
const { Category, BlogPost, User, PostCategory } = require('../models/index');

const verifyCategId = async (ids) => {
    const findAllIds = await Category.findAndCountAll({
        where: {
            id: ids,
        },
    });
    if (findAllIds.count !== ids.length) {
        return { type: 'NOT_FOUND', message: '"categoryIds" not found' };
    }
    return { type: null, message: '' };
};

const newPost = async (title, content, user) => {
    const createPost = await BlogPost.create({
        title, 
        content,
        userId: user.id, 
        published: new Date(),
        updated: new Date(),
     });
     return createPost;
};

const assignCategory = (postId, categoriesId) => {
    try {
        categoriesId.forEach(async (categ) => {
            await PostCategory.create({ postId, categoryId: categ });
        });
    } catch (err) {
        console.log('Error', err);
    }
};

const getIdByToken = async (auth) => {
    const TOKEN_SECRET = process.env.JWT_SECRET;
    const user = jwt.verify(auth, TOKEN_SECRET);

    const userId = await User.findOne({
        where: { email: user.email },
    });

    return userId.dataValues;
};

const createBlogPost = async ({ title, content, categoryIds }, auth) => {
    if (!title || !content || categoryIds.length === 0) {
        return { type: 'MISSING_FIELDS', message: 'Some required fields are missing' };
    }

    const errorFields = await verifyCategId(categoryIds);

    if (errorFields.type) return errorFields.message;

    const user = await getIdByToken(auth);

    const post = await newPost(title, content, user);
    
    assignCategory(post.dataValues.id, categoryIds);

    return post;
};

const getPost = async (auth) => {
    const { id } = await getIdByToken(auth);
    const allPosts = BlogPost.findAll({
        where: { userId: id },
        include: [
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
            { model: Category, as: 'categories' },
        ],
    });
    return allPosts;
};

module.exports = {
    createBlogPost,
    getPost,
};