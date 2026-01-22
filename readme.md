nest g module|controller|service users
nest g controller users

pnpm exec prisma migrate dev --name create_users
pnpm exec prisma generate