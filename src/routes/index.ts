import express from 'express';
import images from './api/images';

const router = express.Router();

/* GET home page. */
router.use('/images', images);

export default router;
