export const USER_SAFE_SELECT = {
  id: true,
  email: true,
  phone: true,
  isVerified: true,
  createdAt: true,

  profile: {
    select: {
      gender: true,
      birthDate: true,
      city: true,
      country: true,
    },
  },
};
