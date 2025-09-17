import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { drivers, ADMIN_CREDENTIALS } from '../data/busRoutes';
import { auth } from '../firebase';

async function addUsers() {
  try {
    // Add admin user
    await createUserWithEmailAndPassword(
      auth,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password
    );
    console.log('Admin user created successfully');

    // Add all drivers
    for (const driver of drivers) {
      try {
        await createUserWithEmailAndPassword(
          auth,
          driver.email,
          driver.password
        );
        console.log(`Driver ${driver.name} created successfully`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Driver ${driver.name} already exists`);
        } else {
          console.error(`Error creating driver ${driver.name}:`, error);
        }
      }
    }

    console.log('All users have been processed');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
}

addUsers();