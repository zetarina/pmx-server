import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { comparePassword } from "../utils/crypto-utils";
import { UserRepository } from "../repositories/UserRepository";
import { config } from "../config";

const userRepository = new UserRepository();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        const isMatch = await comparePassword(
          password,
          user.salt,
          user.hashedPassword
        );
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userRepository.getUserById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  if (user && user._id) {
    done(null, user._id.toString());
  } else {
    done(new Error("User or user ID is undefined"));
  }
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
