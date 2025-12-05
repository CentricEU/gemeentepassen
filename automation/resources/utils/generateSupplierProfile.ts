import * as faker from 'faker/locale/nl';

interface SupplierProfile {
  firstName: string;
  lastName: string;
  companyName: string;
  kvkNumber: string;
  email: string;
  ownerName: string;
  companyBranchAddress: string;
  branchProvince: string;
  branchZipCode: string;
  branchLocation: string;
  accountManager: string;
  latitude: number;
  longitude: number;
}

export class SupplierProfileGenerator {
  generateProfile(): SupplierProfile {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      companyName: faker.company.companyName(),
      kvkNumber: faker.datatype.number({ min: 10000000, max: 99999999 }).toString(),
      email: faker.internet.email(),
      ownerName: faker.name.findName(),
      companyBranchAddress: faker.address.streetAddress(),
      branchProvince: faker.address.state(),
      branchZipCode: faker.address.zipCode('####??'),
      branchLocation: faker.address.city(),
      accountManager: faker.name.findName(),
      latitude: parseFloat(faker.address.latitude()),
      longitude: parseFloat(faker.address.longitude())
    };
  }
}
