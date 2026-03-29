import { Prisma } from '../generated/prisma/client';

export const CHAT_PARTICIPANT_SELECT = {
  id: true,
  email: true,
  phone: true,
  lastActiveAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      name: true,
      userName: true,
      gender: true,
      bio: true,
      birthDate: true,
      heightCm: true,
      lookingFor: true,
      interests: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
    },
  },
  photos: {
    select: {
      id: true,
      url: true,
      isPrimary: true,
      createdAt: true,
    },
    orderBy: [
      { isPrimary: Prisma.SortOrder.desc },
      { createdAt: Prisma.SortOrder.asc },
    ],
  },
} satisfies Prisma.UserSelect;

export const CHAT_MESSAGE_SELECT = {
  id: true,
  chatId: true,
  senderId: true,
  content: true,
  isRead: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      email: true,
      phone: true,
      profile: {
        select: {
          id: true,
          userId: true,
          name: true,
          userName: true,
        },
      },
      photos: {
        select: {
          id: true,
          url: true,
          isPrimary: true,
        },
        orderBy: [
          { isPrimary: Prisma.SortOrder.desc },
          { createdAt: Prisma.SortOrder.asc },
        ],
      },
    },
  },
} satisfies Prisma.MessageSelect;
