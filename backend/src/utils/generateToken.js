import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });

    return token;
};

export default generateToken;