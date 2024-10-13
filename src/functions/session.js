import session from 'next-session';

export const getSession = session({
  password: process.env.SESSION_SECRET,
  cookieName: 'auth_token',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
});

// Create a setSession function
export const setSession = async (req, sessionData) => {
    console.log(req, "request for session is here")
  const session = await getSession(req);
  Object.assign(session, sessionData); // Merge session data
  await session.save(); // Save the session
};
