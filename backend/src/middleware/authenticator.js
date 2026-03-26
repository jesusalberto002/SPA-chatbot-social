const jwt = require("jsonwebtoken");
const prisma = require("./prisma");
require("dotenv").config();

exports.authenticator = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(400).json({message: 'Authentication Invalid'})
    }

    try{
        const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    //req.user will exist throughout the whole request execution and carry after next
    const user = await prisma.user.findUnique({
        where: { 
            id: decoded.id 
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImageUrl: true,
            // You can also fetch related data at the same time
            subscriptions: {
                where: { status: 'ACTIVE' },
                select: {
                    tier: {
                    select: { name: true }
                    }
                }
            },
            therapist: true, // Include therapist relationship
        }
    });
    req.user = user;

    prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
    }).catch(err => {
        console.error("Failed to update lastActiveAt", err);
    });

    if (!req.user) return res.status(401).json({ message: "User not found." });

    next();

    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
}