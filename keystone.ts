import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';

import 'dotenv/config';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';

const databaseURL =
  process.env.DATABASE_URL ||
  'mongodb+srv://sickFitAdmin:sickFitAdmin@cluster0.ztbx6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: add init role
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      onConnect: async (keystone) => {
        console.log('Connected to DB!');
        if (process.argv.includes('--seed-data'))
          await insertSeedData(keystone);
      },
    },
    lists: createSchema({
      User,
      Product,
      ProductImage,
      // TODO: schema item goes here
    }),
    ui: {
      // show UI only for people who pass this test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQl query
      User: 'id name email',
    }),
  })
);
