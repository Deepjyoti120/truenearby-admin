nest g module|controller|service users
nest g controller users

pnpm exec prisma migrate dev --name create_users
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec prisma migrate resolve --rolled-back "20260124021641_add_postgis"

pnpm exec nest g module prisma
pnpm exec nest g service prisma

pnpm exec prisma studio

<!-- Api controller, module, service -->
nest g module auth
nest g controller auth
nest g service auth

pnpm exec nest g module profile
pnpm exec nest g controller profile
pnpm exec nest g service profile

pnpm exec nest g module matches
pnpm exec nest g controller matches
pnpm exec nest g service matches


