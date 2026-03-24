import { BadRequestException, Injectable } from '@nestjs/common';

export type PreferredAgeRange = {
  minAge: number;
  maxAge: number;
};

@Injectable()
export class ProfilePreferencesService {
  private static readonly DEFAULT_MIN_PREFERRED_AGE = 18;
  private static readonly DEFAULT_MAX_PREFERRED_AGE = 99;

  normalizeInterests(interests?: string[]) {
    if (!interests?.length) {
      return [];
    }

    return [
      ...new Set(interests.map((interest) => interest.trim().toLowerCase())),
    ].filter((interest) => interest.length > 0);
  }

  resolvePreferredAgeRange(
    minAge?: number,
    maxAge?: number,
  ): PreferredAgeRange {
    const normalizedMinAge =
      minAge ?? ProfilePreferencesService.DEFAULT_MIN_PREFERRED_AGE;
    const normalizedMaxAge =
      maxAge ?? ProfilePreferencesService.DEFAULT_MAX_PREFERRED_AGE;

    if (normalizedMinAge > normalizedMaxAge) {
      throw new BadRequestException(
        'preferredMinAge must be less than or equal to preferredMaxAge',
      );
    }

    return {
      minAge: normalizedMinAge,
      maxAge: normalizedMaxAge,
    };
  }
}
