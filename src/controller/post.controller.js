const service = require('../services/post.services');

const createPost = async (req, res) => {
    const auth = req.headers.authorization;
    const data = req.body;

    const result = await service.createBlogPost(data, auth);
    console.log(result);

    if (result.type) return res.status(400).json({ message: result.message });
    if (result === '"categoryIds" not found') {
        return res.status(400).json({ message: '"categoryIds" not found' });
    }
    
    return res.status(201).json(result);
};

const getPost = async (req, res) => {
    const auth = req.headers.authorization;
    const result = await service.getPost(auth);
    res.status(200).json(result);
};

module.exports = {
    createPost,
    getPost,
};