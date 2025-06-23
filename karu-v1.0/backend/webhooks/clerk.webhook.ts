/**
 * Clerk Webhook Handler
 * Processes webhook events from Clerk for user management
 */
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { UserRepository } from '../repositories';
import { clerk } from '../config/clerk';

// Webhook signature secret from Clerk
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

/**
 * Processes Clerk webhook events
 */
export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    if (!CLERK_WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is missing from environment variables');
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    // Get the webhook signature from the request headers
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing SVIX headers');
      return res.status(400).json({ error: 'Missing SVIX headers' });
    }

    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);

    // Verify the webhook payload
    const payload = req.body;
    const body = JSON.stringify(payload);
    
    // Prepare headers for verification
    const svixHeaders = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    };

    let evt: { type: string; data: any };
    try {
      // Verify the webhook against the headers
      evt = wh.verify(body, svixHeaders) as { type: string; data: any };
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Get the event type and data
    const { type, data } = evt;
    
    console.log(`Handling Clerk webhook event: ${type}`);

    // Process different event types
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'session.created':
        // Handle session created events to ensure users exist
        // This is a fallback for when user.created events might be missed
        await handleSessionCreated(data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    // Return a 200 status to acknowledge receipt of the webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle user.created event
 */
async function handleUserCreated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    
    // Extract primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === data.primary_email_address_id);
    const emailValue = primaryEmail?.email_address || email_addresses?.[0]?.email_address;
    
    if (!emailValue) {
      console.error('Missing email address in user.created event:', data);
      return;
    }

    // Check if user already exists (avoid duplicates)
    const existingUser = await UserRepository.findByClerkId(id);
    
    if (existingUser) {
      console.log(`User already exists with clerkId ${id}, skipping creation`);
      return;
    }

    // Create name from first and last name
    const name = [first_name, last_name].filter(Boolean).join(' ') || emailValue.split('@')[0];
    
    // Create user in database
    const newUser = await UserRepository.create({
      clerkId: id,
      email: emailValue,
      name: name,
      role: 'staff', // Default role
      // Cast to any to handle imageUrl property which is added to the schema
      ...((image_url ? { imageUrl: image_url } : {}) as any)
    });
    
    console.log(`Created new user with ID: ${newUser.id}, clerkId: ${id}`);
  } catch (error) {
    console.error('Error handling user.created event:', error);
  }
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(data: any) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    
    // Find user by clerk ID
    const user = await UserRepository.findByClerkId(id);
    
    if (!user) {
      console.log(`User not found with clerkId ${id}, creating instead of updating`);
      // If user doesn't exist, treat this as a creation event
      return await handleUserCreated(data);
    }

    // Extract primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === data.primary_email_address_id);
    const emailValue = primaryEmail?.email_address || email_addresses?.[0]?.email_address;
    
    // Create name from first and last name
    const name = [first_name, last_name].filter(Boolean).join(' ') || user.name;
    
    // Update user data
    const updates: any = {};
    
    if (emailValue && emailValue !== user.email) {
      updates.email = emailValue;
    }
    
    if (name && name !== user.name) {
      updates.name = name;
    }
    
    // Update image URL if changed
    const userAny = user as any; // Temporary type assertion to handle imageUrl property
    if (image_url && image_url !== userAny.imageUrl) {
      updates.imageUrl = image_url;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      const updatedUser = await UserRepository.update(user.id, updates);
      console.log(`Updated user with ID: ${updatedUser.id}, clerkId: ${id}`);
    } else {
      console.log(`No changes detected for user with ID: ${user.id}, clerkId: ${id}`);
    }
  } catch (error) {
    console.error('Error handling user.updated event:', error);
  }
}

/**
 * Handle session.created event
 * This is a fallback mechanism to ensure users exist even if user.created events are missed
 */
async function handleSessionCreated(data: any) {
  try {
    // Extract user ID from the session data
    const { user_id } = data;
    
    if (!user_id) {
      console.error('Missing user_id in session.created event:', data);
      return;
    }
    
    // Check if user already exists
    const existingUser = await UserRepository.findByClerkId(user_id);
    
    if (existingUser) {
      console.log(`User already exists with clerkId ${user_id}, no action needed for session.created`);
      return;
    }
    
    console.log(`User not found with clerkId ${user_id} for session.created event, fetching from Clerk API`);
    
    try {
      // Fetch user details from Clerk API
      const clerkUser = await clerk.users.getUser(user_id);
      
      if (!clerkUser) {
        console.error(`Failed to fetch user details from Clerk for user_id: ${user_id}`);
        return;
      }
      
      // Get primary email
      const primaryEmailId = clerkUser.primaryEmailAddressId;
      const emailObj = clerkUser.emailAddresses?.find((emailAddr: any) => emailAddr.id === primaryEmailId) || 
                      clerkUser.emailAddresses?.[0];
      const email: string = emailObj?.emailAddress || '';
      
      if (!email) {
        console.error(`No email found for Clerk user ${user_id}`);
        return;
      }
      
      // Create name
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
      
      // Create user in database
      const newUser = await UserRepository.create({
        clerkId: user_id,
        email,
        name,
        role: 'staff', // Default role
        // Cast to any to handle imageUrl property which is added to the schema
        ...((clerkUser.imageUrl ? { imageUrl: clerkUser.imageUrl } : {}) as any)
      });
      
      console.log(`Created user from session.created with ID: ${newUser.id}, clerkId: ${user_id}`);
    } catch (clerkError) {
      console.error(`Error fetching user from Clerk API: ${clerkError}`);
      
      // Create a minimal user record with just the clerk ID as fallback
      const placeholderEmail = `user-${user_id.substring(0, 8)}@placeholder.com`;
      const placeholderName = `User ${user_id.substring(0, 8)}`;
      
      const newUser = await UserRepository.create({
        clerkId: user_id,
        email: placeholderEmail,
        name: placeholderName,
        role: 'staff'
      });
      
      console.log(`Created minimal user with ID: ${newUser.id}, clerkId: ${user_id} from session.created event`);
    }
  } catch (error) {
    console.error('Error handling session.created event:', error);
  }
}
