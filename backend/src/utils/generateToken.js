import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const generateToken = (user) => {
    const accessToken = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user._id, email: user.email }, config.refreshTokenSecret, {
        expiresIn: "15d",
    });

    return { accessToken, refreshToken };
};

export default generateToken;