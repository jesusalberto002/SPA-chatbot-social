const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function createHaivenBot() {
    console.log('Checking for Haiven AI bot user...');
    
    const haivenBot = await prisma.user.findUnique({
        where: { id: 100 }, // Using a predictable ID
    });

    if (!haivenBot) {
        console.log('Haiven AI bot user not found. Creating...');
        await prisma.user.create({
            data: {
                id: 100, // IMPORTANT: Using a static ID for the bot
                email: 'haiven@system.bot',
                password: await bcrypt.hash(faker.string.uuid(), 10), // Secure random password
                role: UserRole.BOT,
                firstName: 'Haiven',
                lastName: 'AI',
                isEmailVerified: true,
            },
        });
        console.log('🤖 Haiven AI bot user created with ID: 2.');
    } else {
        console.log('🤖 Haiven AI bot user already exists.');
    }
}

async function main() {
    // Call the function to create the bot user.
    await createHaivenBot();
    
    // The rest of your existing seeding logic can go here.
    // If you only want to add the bot, you can comment out the rest of the function.
    console.log('Seeding process checked for Haiven user.');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });