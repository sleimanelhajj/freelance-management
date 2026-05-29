import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { env } from "./env";
import { authService } from "../services/auth.service";

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const result = await authService.loginOrRegisterWithGoogle(profile);
          done(null, result);
        } catch (error) {
          done(error as Error, undefined);
        }
      },
    ),
  );
} else {
  console.warn(
    "[auth] Google OAuth is disabled because GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing.",
  );
}

export default passport;
