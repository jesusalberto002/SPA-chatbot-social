const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function createAssistantBot() {
    console.log('Checking for assistant bot user...');
    
    const assistantBot = await prisma.user.findUnique({
        where: { id: 100 }, // Using a predictable ID
    });

    if (!assistantBot) {
        console.log('Assistant bot user not found. Creating...');
        await prisma.user.create({
            data: {
                id: 100, // IMPORTANT: Using a static ID for the bot
                email: 'assistant@system.local',
                password: await bcrypt.hash(faker.string.uuid(), 10), // Secure random password
                role: UserRole.BOT,
                firstName: 'Assistant',
                lastName: 'AI',
                isEmailVerified: true,
            },
        });
        console.log('🤖 Assistant bot user created with ID: 100.');
    } else {
        console.log('🤖 Assistant bot user already exists.');
    }
}

async function main() {
    // Call the function to create the bot user.
    await createAssistantBot();
    
    // The rest of your existing seeding logic can go here.
    // If you only want to add the bot, you can comment out the rest of the function.
    console.log('Seeding process checked for assistant user.');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });