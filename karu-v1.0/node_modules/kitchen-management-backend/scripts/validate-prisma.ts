/**
 * Prisma validation script
 * Validates the Prisma setup and connection to the database
 */
import { prisma } from '../db/prisma';

async function main() {
  console.log('Validating Prisma setup...');
  
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful:', result);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Database contains ${userCount} users`);
    
    // Count recipes
    const recipeCount = await prisma.recipe.count();
    console.log(`Database contains ${recipeCount} recipes`);
    
    // Count menus
    const menuCount = await prisma.menu.count();
    console.log(`Database contains ${menuCount} menus`);
    
    console.log('Prisma validation completed successfully!');
  } catch (error) {
    console.error('Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
