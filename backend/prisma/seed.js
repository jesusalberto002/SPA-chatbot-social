/**
 * Minimal seed for local/RDS smoke tests. Re-run wipes and re-seeds core rows.
 *
 * Run against RDS from your machine:
 * 1) SSH tunnel (separate terminal, keep open):
 *    ssh -i your.pem -N -L 5433:<rds-endpoint>:5432 ec2-user@<bastion-ip>
 * 2) In backend/.env set DATABASE_URL to use the tunnel, e.g.:
 *    postgresql://USER:ENCODED_PASSWORD@127.0.0.1:5433/haivens?schema=public
 * 3) Apply migrations, then seed:
 *    cd backend && npx prisma migrate deploy && npx prisma db seed
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const {
  PrismaClient,
  SubscriptionTierType,
  UserRole,
  SubscriptionStatus,
  CommunityRole,
  VoteType,
  Tags,
  BillingCycle,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Load backend/.env before running the seed.');
}

const prisma = new PrismaClient();

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('Starting minimal seed...');

  console.log('Cleaning existing data...');
  await prisma.report.deleteMany();
  await prisma.commentReaction.deleteMany();
  await prisma.commentVote.deleteMany();
  await prisma.postReaction.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.userCommunitySuspension.deleteMany();
  await prisma.userTagProfile.deleteMany();
  await prisma.userSummaryProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.avatars.deleteMany();
  await prisma.subscriptionTier.deleteMany();
  console.log('Database cleaned.');

  const tiers = await prisma.subscriptionTier.createManyAndReturn({
    data: [
      {
        name: SubscriptionTierType.FREE,
        description: 'Free tier with limited features',
        price: 0.0,
        features: ['Basic community access', 'Limited chat support'],
      },
      {
        name: SubscriptionTierType.BRONZE,
        description: 'Bronze tier with enhanced features',
        price: 13.99,
        features: ['Full community access', 'Priority support', 'Exclusive content'],
      },
      {
        name: SubscriptionTierType.PLATINUM,
        description: 'Platinum tier with all features',
        price: 23.99,
        features: ['All Bronze features', '24/7 dedicated support', 'Early access to new features'],
      },
    ],
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const testPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mail.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
    },
  });

  const testUserA = await prisma.user.create({
    data: {
      email: 'seed-test-a@example.com',
      password: testPassword,
      firstName: 'Seed',
      lastName: 'TestA',
      isEmailVerified: true,
    },
  });

  const testUserB = await prisma.user.create({
    data: {
      email: 'seed-test-b@example.com',
      password: testPassword,
      firstName: 'Seed',
      lastName: 'TestB',
      isEmailVerified: true,
    },
  });

  const users = [adminUser, testUserA, testUserB];

  const botUser = await prisma.user.create({
    data: {
      id: 100,
      email: 'haiven@system.bot',
      firstName: 'Haiven',
      lastName: 'AI',
      password:
        '$2b$10$GjIoxpGmbdenwdPPkIRNyeMOllE/l07WHsKGh417Xy/4VmxzjVpGq',
      role: UserRole.BOT,
      isEmailVerified: true,
      hasSeenWelcomeModal: false,
      hasSeenCommunityIntroModal: false,
    },
  });

  const therapists = await prisma.$transaction([
    prisma.therapist.create({
      data: {
        name: 'Kylie',
        voiceId: 'aura-2-theia-en',
        url: 'https://api.deepgram.com/v1/speak?model=aura-2-theia-en&encoding=linear16&container=wav',
        provider: 'DEEPGRAM',
        specialty: 'General Therapy',
        bio: 'Kylie is a compassionate Australian therapist specializing in general therapy and holistic wellbeing.',
        imageUrl: '/therapists/Kylie_Haivens_Therapist.png',
        systemPrompt:
          'You are Kylie, a warm and empathetic Australian therapist. Your tone is supportive and gentle. You specialize in general therapy.',
      },
    }),
    prisma.therapist.create({
      data: {
        name: 'Oliver',
        voiceId: 'aura-2-hyperion-en',
        url: 'https://api.deepgram.com/v1/speak?model=aura-2-hyperion-en&encoding=linear16&container=wav',
        provider: 'DEEPGRAM',
        specialty: 'General Therapy',
        bio: 'Oliver is an experienced Australian therapist focused on general therapy and providing a safe space for growth.',
        imageUrl: '/therapists/Oliver_Haivens_Therapist.png',
        systemPrompt:
          'You are Oliver, a calm and grounded Australian therapist. Your tone is professional yet deeply caring. You specialize in general therapy.',
      },
    }),
  ]);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        therapist: { connect: { id: getRandomItem(therapists).id } },
      },
    });
  }

  const freeTier = tiers.find((t) => t.name === SubscriptionTierType.FREE);
  const platinumTier = tiers.find((t) => t.name === SubscriptionTierType.PLATINUM);

  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      tierId: platinumTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.MONTHLY,
    },
  });
  await prisma.subscription.create({
    data: {
      userId: testUserA.id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });
  await prisma.subscription.create({
    data: {
      userId: testUserB.id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });
  await prisma.subscription.create({
    data: {
      userId: botUser.id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });

  await prisma.avatars.createMany({
    data: [{ name: 'seed-placeholder', url: 'https://example.com/avatar-placeholder.png' }],
    skipDuplicates: true,
  });

  // --- Minimal forum sample (easy to spot / delete: search "Seed Test" or emails seed-test-*@) ---
  const community = await prisma.community.create({
    data: {
      name: 'Seed Test Community',
      description: 'Temporary community for integration tests.',
      creatorId: adminUser.id,
      tags: [Tags.MINDFULNESS, Tags.WELLNESS],
    },
  });

  await prisma.communityMember.create({
    data: {
      userId: adminUser.id,
      communityId: community.id,
      role: CommunityRole.ADMIN,
    },
  });
  await prisma.communityMember.create({
    data: {
      userId: testUserA.id,
      communityId: community.id,
      role: CommunityRole.MEMBER,
    },
  });
  await prisma.communityMember.create({
    data: {
      userId: testUserB.id,
      communityId: community.id,
      role: CommunityRole.MEMBER,
    },
  });

  const post = await prisma.post.create({
    data: {
      title: 'Seed test post',
      content: 'Hello from the seed script. Safe to delete this community later.',
      authorId: adminUser.id,
      communityId: community.id,
      tags: [Tags.WELLNESS],
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Seed test comment',
      authorId: testUserA.id,
      postId: post.id,
    },
  });

  await prisma.postVote.create({
    data: {
      userId: testUserB.id,
      postId: post.id,
      type: VoteType.UP,
    },
  });

  console.log('Minimal seed finished (admin + 2 test users + bot, 1 community, 1 post, 1 comment, 1 vote).');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
