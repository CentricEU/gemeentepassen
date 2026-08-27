export const TestData = {
    LONG_TEXT: "This is a long text".repeat(300),
    HTML_TEXT: "<p>This is a paragraph</p>"
};

export const PAGE_TITLES = {
  MUNICIPALITY: 'Gemeentepas Overheid',
  SUPPLIER: 'Gemeentepas Aanbieder'
} as const;

export const URL_PATTERNS = {
  LOGIN: '**/login*',
  DASHBOARD: '**/dashboard*',
  LOGOUT: '**/logout*'
} as const;

export const registerSupplierTestData = {
    firstName: "Test",
    lastName: "Name",
    email: "test.name@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    companyName: "Test Industries",
    kvkNumber: "12345670",
    municipality: "Automation"
  
};

export const userManagementTestData = {
    firstName: "Test",
    lastName: "User",
    email: "test.user@example.com",
    date: new Date().toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }),
    roleAdmin: "Beheerder",
    roleSuperAdmin: "Superbeheerder"
};

export const sendInvitationTestData = {
    message: "You are invited to join our platform!",
    email: "test.invitation@example.com"
};