import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const env = {
  port: Number(process.env.PORT || 6000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || "development"
};
