export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data: {
      name?: string;
      dob?: Date;
      preferredLevel?: string;
      referenceWeightKg?: number;
      referencePaceMinPerKm?: number;
    },
  ) {}
}
