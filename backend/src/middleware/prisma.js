const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const isBcryptHash = (value) =>
  typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);

const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async $allOperations({ model, operation, args, query }) {
        // Hash passwords on writes; skip if already hashed.
        if (
          (operation === 'create' || operation === 'update' || operation === 'upsert') &&
          args?.data?.password &&
          !isBcryptHash(args.data.password)
        ) {
          const salt = await bcrypt.genSalt(10);
          args.data.password = await bcrypt.hash(args.data.password, salt);
        }

        return query(args);
      },
    },
  },
});

module.exports = prisma;