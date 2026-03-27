/**
 * Rich seed for local/RDS: tiers, users, therapists, selectable avatars, communities, posts, comments, votes.
 * Avatar and banner URLs are frontend static paths (`/avatars/...`, `/communities/...`) resolved by the SPA origin.
 *
 * Run: cd backend && npx prisma migrate deploy && npx prisma db seed
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
  Gender,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Load backend/.env before running the seed.');
}

const prisma = new PrismaClient();

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Paths match files in `webFrontend/public/` */
const AVATAR_CHOICES = [
  { name: 'Aurora', url: '/avatars/avatar-01.svg' },
  { name: 'River', url: '/avatars/avatar-02.svg' },
  { name: 'Jade', url: '/avatars/avatar-03.svg' },
  { name: 'Ember', url: '/avatars/avatar-04.svg' },
  { name: 'Sage', url: '/avatars/avatar-05.svg' },
  { name: 'Skye', url: '/avatars/avatar-06.svg' },
  { name: 'Noor', url: '/avatars/avatar-07.svg' },
  { name: 'Iris', url: '/avatars/avatar-08.svg' },
];

async function main() {
  console.log('Starting database seed...');

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
  const testPassword = await bcrypt.hash('password', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mail.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      gender: Gender.PREFER_NOT_TO_SAY,
      isEmailVerified: true,
    },
  });

  const seedUserDefs = [
    { email: 'seed-test-a@example.com', firstName: 'Alex', lastName: 'Rivera', gender: Gender.MALE },
    { email: 'seed-test-b@example.com', firstName: 'Jordan', lastName: 'Lee', gender: Gender.NON_BINARY },
    { email: 'seed-test-c@example.com', firstName: 'Sam', lastName: 'Patel', gender: Gender.PREFER_NOT_TO_SAY },
    { email: 'seed-test-d@example.com', firstName: 'Casey', lastName: 'Nguyen', gender: Gender.FEMALE },
    { email: 'seed-test-e@example.com', firstName: 'Riley', lastName: 'Brooks', gender: Gender.MALE },
    { email: 'seed-test-f@example.com', firstName: 'Morgan', lastName: 'Chen', gender: Gender.FEMALE },
    { email: 'seed-test-g@example.com', firstName: 'Taylor', lastName: 'Kim', gender: Gender.OTHER },
  ];

  const seedUsers = [];
  for (const def of seedUserDefs) {
    seedUsers.push(
      await prisma.user.create({
        data: {
          email: def.email,
          password: testPassword,
          firstName: def.firstName,
          lastName: def.lastName,
          gender: def.gender,
          isEmailVerified: true,
        },
      }),
    );
  }

  const humanUsers = [adminUser, ...seedUsers];

  const botUser = await prisma.user.create({
    data: {
      id: 100,
      email: 'assistant@system.local',
      firstName: 'Assistant',
      lastName: 'AI',
      password:
        '$2b$10$GjIoxpGmbdenwdPPkIRNyeMOllE/l07WHsKGh417Xy/4VmxzjVpGq',
      role: UserRole.BOT,
      isEmailVerified: true,
      hasSeenWelcomeModal: false,
      hasSeenCommunityIntroModal: false,
      profileImageUrl: '/assistant-avatar.svg',
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
        imageUrl: '/avatars/therapist-kylie.svg',
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
        imageUrl: '/avatars/therapist-oliver.svg',
        systemPrompt:
          'You are Oliver, a calm and grounded Australian therapist. Your tone is professional yet deeply caring. You specialize in general therapy.',
      },
    }),
  ]);

  for (const user of humanUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        therapist: { connect: { id: getRandomItem(therapists).id } },
      },
    });
  }

  const freeTier = tiers.find((t) => t.name === SubscriptionTierType.FREE);
  const platinumTier = tiers.find((t) => t.name === SubscriptionTierType.PLATINUM);
  const bronzeTier = tiers.find((t) => t.name === SubscriptionTierType.BRONZE);

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
      userId: seedUsers[0].id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });
  await prisma.subscription.create({
    data: {
      userId: seedUsers[1].id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });
  await prisma.subscription.create({
    data: {
      userId: seedUsers[2].id,
      tierId: bronzeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.MONTHLY,
    },
  });
  for (const u of seedUsers.slice(3)) {
    await prisma.subscription.create({
      data: {
        userId: u.id,
        tierId: freeTier.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.NONE,
      },
    });
  }
  await prisma.subscription.create({
    data: {
      userId: botUser.id,
      tierId: freeTier.id,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.NONE,
    },
  });

  await prisma.avatars.createMany({
    data: AVATAR_CHOICES,
    skipDuplicates: true,
  });

  const avatarRows = await prisma.avatars.findMany({ orderBy: { id: 'asc' } });
  const urlByIndex = (i) => avatarRows[i]?.url ?? AVATAR_CHOICES[i]?.url;

  for (let i = 0; i < humanUsers.length; i++) {
    await prisma.user.update({
      where: { id: humanUsers[i].id },
      data: { profileImageUrl: urlByIndex(i) },
    });
  }

  const communityDefs = [
    {
      name: 'Mindful Wellness Hub',
      description:
        'A calm space for meditation tips, gentle routines, and sharing what helps you stay present.',
      imageUrl: '/communities/banner-mindfulness.svg',
      tags: [Tags.MINDFULNESS, Tags.MEDITATION, Tags.WELLNESS],
      creatorId: adminUser.id,
    },
    {
      name: 'Fitness & Nutrition Network',
      description: 'Meal ideas, training wins, and evidence-based nutrition without the diet culture noise.',
      imageUrl: '/communities/banner-fitness.svg',
      tags: [Tags.FITNESS, Tags.NUTRITION, Tags.HEALTHY_EATING],
      creatorId: seedUsers[0].id,
    },
    {
      name: 'Mental Health Support Circle',
      description: 'Peer support for anxiety, low mood, and stress. Not a substitute for professional care.',
      imageUrl: '/communities/banner-mental-health.svg',
      tags: [Tags.MENTAL_HEALTH, Tags.ANXIETY, Tags.WELLNESS],
      creatorId: seedUsers[1].id,
    },
    {
      name: 'Work-Life Balance Collective',
      description: 'Boundaries, burnout prevention, and realistic strategies for busy schedules.',
      imageUrl: '/communities/banner-work-life.svg',
      tags: [Tags.WORK_LIFE_BALANCE, Tags.BURNOUT_PREVENTION, Tags.SELF_CARE],
      creatorId: seedUsers[2].id,
    },
    {
      name: 'Sleep & Recovery Lounge',
      description: 'Wind-down ideas, sleep hygiene, and recovery habits that actually fit real life.',
      imageUrl: '/communities/banner-sleep.svg',
      tags: [Tags.SLEEP_HEALTH, Tags.DIGITAL_DETOX, Tags.WELLNESS],
      creatorId: seedUsers[3].id,
    },
  ];

  const communities = [];
  for (const c of communityDefs) {
    communities.push(await prisma.community.create({ data: c }));
  }

  const allMemberIds = humanUsers.map((u) => u.id);
  for (const comm of communities) {
    await prisma.communityMember.create({
      data: {
        userId: comm.creatorId,
        communityId: comm.id,
        role: CommunityRole.ADMIN,
      },
    });
    for (const uid of allMemberIds) {
      if (uid === comm.creatorId) continue;
      await prisma.communityMember.create({
        data: {
          userId: uid,
          communityId: comm.id,
          role: CommunityRole.MEMBER,
        },
      });
    }
  }

  const [c0, c1, c2, c3, c4] = communities;
  const [uAdmin, uA, uB, uC, uD, uE, uF, uG] = humanUsers;

  const postSeeds = [
    {
      communityId: c0.id,
      authorId: uAdmin.id,
      title: 'Five-minute breathing reset',
      content:
        'When my mind races, I use box breathing: inhale 4, hold 4, exhale 4, hold 4. What small practice helps you reset?',
      tags: [Tags.MINDFULNESS, Tags.MEDITATION],
    },
    {
      communityId: c0.id,
      authorId: uA.id,
      title: 'Morning light and mood',
      content:
        'I try to get outside within an hour of waking. Curious if others track light exposure or just go by feel.',
      tags: [Tags.WELLNESS, Tags.MENTAL_HEALTH],
    },
    {
      communityId: c0.id,
      authorId: uB.id,
      title: 'Guided apps vs silence',
      content: 'Do you prefer guided meditations or sitting in silence? I switch depending on how scattered I feel.',
      tags: [Tags.MEDITATION, Tags.MINDFULNESS],
    },
    {
      communityId: c1.id,
      authorId: uC.id,
      title: 'Protein at breakfast — overrated?',
      content:
        'I have been experimenting with higher protein breakfasts and fewer mid-morning crashes. Would love recipe ideas.',
      tags: [Tags.NUTRITION, Tags.HEALTHY_EATING],
    },
    {
      communityId: c1.id,
      authorId: uD.id,
      title: 'Returning to running after a break',
      content:
        'Week three of couch-to-5k. Shins are fine but motivation dips on rainy days. How do you stay consistent?',
      tags: [Tags.FITNESS, Tags.HEALTHY_HABITS],
    },
    {
      communityId: c1.id,
      authorId: uE.id,
      title: 'Hydration without flavor fatigue',
      content: 'Plain water gets boring. I rotate herbal tea and citrus slices. What works for you?',
      tags: [Tags.NUTRITION, Tags.LIFESTYLE],
    },
    {
      communityId: c2.id,
      authorId: uF.id,
      title: 'Explaining anxiety to family',
      content:
        'My relatives mean well but “just relax” is not helpful. I wrote a short note about what actually helps. Anyone else document their needs?',
      tags: [Tags.ANXIETY, Tags.COMMUNICATION],
    },
    {
      communityId: c2.id,
      authorId: uG.id,
      title: 'Therapy homework wins',
      content:
        'Finished my first thought journal week. Awkward at first but patterns are clearer. Small win, sharing in case it encourages someone.',
      tags: [Tags.MENTAL_HEALTH, Tags.MINDFULNESS],
    },
    {
      communityId: c2.id,
      authorId: uAdmin.id,
      title: 'Crisis resources reminder',
      content:
        'If you are in immediate danger, contact local emergency services. This forum is peer support, not crisis care.',
      tags: [Tags.MENTAL_HEALTH, Tags.WELLNESS],
    },
    {
      communityId: c3.id,
      authorId: uA.id,
      title: 'Blocking “always on” chat after 7pm',
      content:
        'I set app notifications to pause in the evening. Manager pushed back once; we found a compromise. Worth advocating.',
      tags: [Tags.WORK_LIFE_BALANCE, Tags.WORK_STRESS],
    },
    {
      communityId: c3.id,
      authorId: uB.id,
      title: 'Micro-breaks between meetings',
      content: 'Two minutes of stretching between calls reduced my headaches. Sharing the stretch links I use if anyone wants them.',
      tags: [Tags.BURNOUT_PREVENTION, Tags.SELF_CARE],
    },
    {
      communityId: c3.id,
      authorId: uC.id,
      title: 'Saying no without guilt scripts',
      content:
        'I practice: “I can’t take that on right now, but thanks for thinking of me.” Simple but I still rehearse aloud.',
      tags: [Tags.COMMUNICATION, Tags.WORK_LIFE_BALANCE],
    },
    {
      communityId: c4.id,
      authorId: uD.id,
      title: 'Screen curfew experiment',
      content:
        'Phones charge outside the bedroom. Week one was rough; sleep latency improved by day five. Anyone else try this?',
      tags: [Tags.SLEEP_HEALTH, Tags.DIGITAL_DETOX],
    },
    {
      communityId: c4.id,
      authorId: uE.id,
      title: 'Wind-down playlist swap',
      content: 'Instrumental only, no lyrics — share your favorite low-tempo albums for reading before bed.',
      tags: [Tags.SLEEP_HEALTH, Tags.LIFESTYLE],
    },
    {
      communityId: c4.id,
      authorId: uF.id,
      title: 'Naps vs full night recovery',
      content:
        'Weekend naps help but sometimes they steal from night sleep. Still figuring out the balance after shift work.',
      tags: [Tags.SLEEP_HEALTH, Tags.WORK_LIFE_BALANCE],
    },
  ];

  const posts = [];
  for (const p of postSeeds) {
    posts.push(await prisma.post.create({ data: p }));
  }

  const commentTexts = [
    { postIndex: 0, authorId: uA.id, text: 'Thanks for sharing — box breathing got me through a tough week.' },
    { postIndex: 0, authorId: uB.id, text: 'I pair it with feet on the floor to ground myself.' },
    { postIndex: 1, authorId: uC.id, text: 'I use a light alarm in winter; huge difference for me.' },
    { postIndex: 3, authorId: uD.id, text: 'Greek yogurt with berries and chia has been my go-to.' },
    { postIndex: 4, authorId: uE.id, text: 'Rainy day trick: lay clothes out the night before so there is less friction.' },
    { postIndex: 6, authorId: uAdmin.id, text: 'Writing it down is brave — family education is ongoing for many of us.' },
    { postIndex: 9, authorId: uB.id, text: 'Boundaries are a skill — glad you found language that worked.' },
    { postIndex: 12, authorId: uG.id, text: 'Charging outside the bedroom was the single biggest change for me too.' },
  ];

  const createdComments = [];
  for (const c of commentTexts) {
    createdComments.push(
      await prisma.comment.create({
        data: {
          text: c.text,
          authorId: c.authorId,
          postId: posts[c.postIndex].id,
        },
      }),
    );
  }

  const replyOnFirst = createdComments[0];
  await prisma.comment.create({
    data: {
      text: 'Same here — small steps.',
      authorId: uC.id,
      postId: posts[0].id,
      replyToId: replyOnFirst.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'If you want more protein ideas I can DM a few recipes.',
      authorId: uE.id,
      postId: posts[3].id,
      replyToId: createdComments[3].id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Our team adopted “no meeting” blocks — worth proposing.',
      authorId: uD.id,
      postId: posts[9].id,
      replyToId: createdComments[6].id,
    },
  });

  const votePairs = [
    { userId: uB.id, postIndex: 0, type: VoteType.UP },
    { userId: uC.id, postIndex: 0, type: VoteType.UP },
    { userId: uD.id, postIndex: 1, type: VoteType.UP },
    { userId: uE.id, postIndex: 3, type: VoteType.UP },
    { userId: uF.id, postIndex: 4, type: VoteType.UP },
    { userId: uG.id, postIndex: 6, type: VoteType.UP },
    { userId: uA.id, postIndex: 9, type: VoteType.UP },
    { userId: uAdmin.id, postIndex: 12, type: VoteType.UP },
  ];

  for (const v of votePairs) {
    await prisma.postVote.create({
      data: {
        userId: v.userId,
        postId: posts[v.postIndex].id,
        type: v.type,
      },
    });
  }

  await prisma.post.update({
    where: { id: posts[0].id },
    data: { upVoteCount: 2, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[1].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[3].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[4].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[6].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[9].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });
  await prisma.post.update({
    where: { id: posts[12].id },
    data: { upVoteCount: 1, downVoteCount: 0 },
  });

  await prisma.postReaction.createMany({
    data: [
      { userId: uA.id, postId: posts[0].id, reaction: '❤️' },
      { userId: uD.id, postId: posts[4].id, reaction: '💪' },
      { userId: uB.id, postId: posts[12].id, reaction: '✨' },
    ],
    skipDuplicates: true,
  });

  await prisma.commentVote.createMany({
    data: [
      { userId: uD.id, commentId: replyOnFirst.id, type: VoteType.UP },
      { userId: uE.id, commentId: createdComments[3].id, type: VoteType.UP },
    ],
    skipDuplicates: true,
  });

  await prisma.commentReaction.createMany({
    data: [
      { userId: uB.id, commentId: replyOnFirst.id, reaction: '👍' },
      { userId: uF.id, commentId: createdComments[6].id, reaction: '🙌' },
    ],
    skipDuplicates: true,
  });

  console.log(
    `Seed finished: ${humanUsers.length} users + bot, ${therapists.length} therapists, ${avatarRows.length} avatars, ${communities.length} communities, ${posts.length} posts, threaded comments, votes, reactions.`,
  );
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
