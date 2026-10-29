/**
 * Scentify Perfume Studio - Admin Console Accounts Configuration
 * -------------------------------------------------------------
 * This file contains the authorized administrative accounts that have
 * access to the Admin Console (Order Management, Sales Reports, Inventory).
 *
 * To add more admin users, simply append a new account object to the ADMIN_ACCOUNTS array below.
 */

export interface AdminAccount {
  id: string;
  email: string;
  password: string; // Plain password for studio admin authentication
  name: string;
  role: 'admin';
  title?: string;
  department?: string;
  createdAt?: string;
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'admin-01',
    email: 'admin@gmail.com',
    password: 'admin123',
    name: 'Scentify Studio Master Perfumer',
    role: 'admin',
    title: 'Studio Director & Master Perfumer',
    department: 'Executive Scentify & Order Verification',
    createdAt: '2026-10-28',
  },
  // ADD MORE ADMIN ACCOUNTS HERE:
  // Example:
  // {
  //   id: 'admin-02',
  //   email: 'manager@gmail.com',
  //   password: 'managerPassword123',
  //   name: 'Studio Dispatch Manager',
  //   role: 'admin',
  //   title: 'Logistics & Verification Lead',
  //   department: 'Shipping & Fulfillment',
  //   createdAt: '2026-10-28',
  // },
];

/**
 * Validates admin credentials against the configured admin accounts.
 * Returns the matching AdminAccount if valid, or an error message if invalid.
 */
export function validateAdminCredentials(
  email: string,
  password: string
): { success: boolean; account?: AdminAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return {
      success: false,
      error: 'Please enter both admin email and password.',
    };
  }

  const account = ADMIN_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === cleanEmail
  );

  if (!account) {
    return {
      success: false,
      error: 'Admin account not recognized. Access is restricted to authorized personnel.',
    };
  }

  if (account.password !== cleanPassword) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials.',
    };
  }

  return {
    success: true,
    account,
  };
}

/**
 * Helper to check if an email belongs to any registered admin account.
 */
export function isRegisteredAdminEmail(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_ACCOUNTS.some((acc) => acc.email.toLowerCase() === cleanEmail);
}
