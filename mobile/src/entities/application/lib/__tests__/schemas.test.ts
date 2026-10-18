import { applicantInfoSchema, residenceSchema, residencesSchema } from '../schemas';

const residence = {
  address: '2 Oak St',
  landlordName: 'Pat Lee',
  landlordPhone: '+1 555 123 4567',
  moveInDate: '2022-05-01',
  moveOutDate: '2024-09-30',
};

describe('application schemas', () => {
  it('accepts valid applicant information', () => {
    expect(
      applicantInfoSchema.safeParse({
        fullName: 'Jordan Smith',
        phone: '(555) 987-6543',
        email: 'jordan@example.com',
        currentAddress: '10 Elm St',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid phone and email', () => {
    const result = applicantInfoSchema.safeParse({
      fullName: 'Jordan',
      phone: 'call me',
      email: 'nope',
      currentAddress: 'x',
    });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((i) => i.path.join('.'));
    expect(fields).toEqual(expect.arrayContaining(['phone', 'email']));
  });

  it('requires move-out after move-in', () => {
    const result = residenceSchema.safeParse({ ...residence, moveOutDate: '2021-01-01' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['moveOutDate']);
  });

  it('requires at least one residence', () => {
    expect(residencesSchema.safeParse([]).success).toBe(false);
    expect(residencesSchema.safeParse([residence]).success).toBe(true);
  });
});
