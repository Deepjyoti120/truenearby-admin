nest g module|controller|service users
nest g controller users

pnpm exec prisma migrate dev --name create_users
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec prisma migrate resolve --rolled-back "20260124021641_add_postgis"

pnpm exec nest g module prisma
pnpm exec nest g service prisma