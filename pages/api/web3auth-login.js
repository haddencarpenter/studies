import { pick } from 'lodash';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

const onSuccess = (res, user) => {
  const relevantUserData = pick(user, [
    'id',
    'walletAddress', 
    'web3auth_id', 
    'provider', 
    'email', 
    'name', 
    'profile_image',
    'auth_method'
  ]);
  
  let twentyYearsFromNow = new Date();
  twentyYearsFromNow.setFullYear(twentyYearsFromNow.getFullYear() + 20);
  twentyYearsFromNow = twentyYearsFromNow.toUTCString();
  
  res.setHeader('Set-Cookie', `user=${JSON.stringify(relevantUserData)};Expires=${twentyYearsFromNow};Secure;SameSite=Strict;Path=/;`);
  res.status(200).json({ success: true, user: relevantUserData });
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      walletAddress,
      verifierId: web3auth_id,
      typeOfLogin: provider,
      email,
      name,
      profileImage: profile_image
    } = req.body;

    if (!walletAddress || !web3auth_id || !provider) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists by wallet address or web3auth_id
    let existingUser = (await sql`
      SELECT * FROM "User" 
      WHERE "walletAddress" = ${walletAddress} 
      OR "web3auth_id" = ${web3auth_id}
    `)[0];

    if (existingUser) {
      // Update existing user with Web3Auth data if it's a legacy user
      if (existingUser.auth_method === 'legacy' || !existingUser.web3auth_id) {
        const updatedUser = (await sql`
          UPDATE "User" 
          SET 
            "web3auth_id" = ${web3auth_id},
            "provider" = ${provider},
            "email" = ${email || existingUser.email},
            "name" = ${name || existingUser.name},
            "profile_image" = ${profile_image || existingUser.profile_image},
            "auth_method" = 'web3auth',
            "updated_at" = NOW()
          WHERE "id" = ${existingUser.id}
          RETURNING *
        `)[0];
        
        onSuccess(res, updatedUser);
      } else {
        // User already exists with Web3Auth, just update last login
        const updatedUser = (await sql`
          UPDATE "User" 
          SET "updated_at" = NOW()
          WHERE "id" = ${existingUser.id}
          RETURNING *
        `)[0];
        
        onSuccess(res, updatedUser);
      }
    } else {
      // Create new user
      const newUser = (await sql`
        INSERT INTO "User" (
          "walletAddress", 
          "web3auth_id", 
          "provider", 
          "email", 
          "name", 
          "profile_image",
          "auth_method",
          "created_at",
          "updated_at"
        ) VALUES (
          ${walletAddress}, 
          ${web3auth_id}, 
          ${provider}, 
          ${email}, 
          ${name}, 
          ${profile_image},
          'web3auth',
          NOW(),
          NOW()
        ) 
        RETURNING *
      `)[0];
      
      onSuccess(res, newUser);
    }
  } catch (error) {
    console.error('Web3Auth login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;