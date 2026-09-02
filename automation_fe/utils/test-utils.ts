import { Applications } from "./enums/applications.enum";

export const env = {
  SUPPLIER_URL: getRequiredEnvVar("SUPPLIER_URL"),
  CITIZEN_URL: getRequiredEnvVar("CITIZEN_URL"),
  MUNICIPALITY_URL: getRequiredEnvVar("MUNICIPALITY_URL"),
  CITIZEN_APPLY_FOR_PASS_URL: getRequiredEnvVar("CITIZEN_APPLY_FOR_PASS_URL"),
  PASSWORD: getRequiredEnvVar('PASSWORD'),
  EMAIL_MUNICIPALITY_ADMIN: getRequiredEnvVar('EMAIL_MUNICIPALITY_ADMIN'),
  EMAIL_MUNICIPALITY_SUPER_ADMIN: getRequiredEnvVar('EMAIL_MUNICIPALITY_SUPER_ADMIN'),
  EMAIL_SUPPLIER: getRequiredEnvVar('EMAIL_SUPPLIER'),
  EMAIL_CITIZEN: getRequiredEnvVar('EMAIL_CITIZEN'),
};

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export function getBaseUrl(application: Applications): string {
  switch (application) {
    case Applications.SUPPLIER:
      return env.SUPPLIER_URL;
    case Applications.CITIZEN:
      return env.CITIZEN_URL;
    case Applications.MUNICIPALITY:
      return env.MUNICIPALITY_URL;
    case Applications.CITIZEN_APPLY_FOR_PASS:
      return env.CITIZEN_APPLY_FOR_PASS_URL;
    default:
      throw new Error("Unknown application");
  }
}
