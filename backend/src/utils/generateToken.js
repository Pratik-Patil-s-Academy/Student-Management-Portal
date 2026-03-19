import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const generateToken = (user) => {
    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
        expiresIn: "15d",
    });

    return token;
};

export default generateToken;