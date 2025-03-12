import { jwtVerify } from "jose";

export default {
  async fetch(request, env) {
    try {
      // Extract JWT from Authorization header
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

      // Define JWT Validation Parameters
      const PUBLIC_KEY = env.JWT_PUBLIC_KEY; // Use Cloudflare Worker secrets for security
      const EXPECTED_ISSUER = "https://auth-provider.com";
      const EXPECTED_AUDIENCE = "wso2-api";

      // Verify the JWT Signature (RS256 or HS256)
      const { payload } = await jwtVerify(token, PUBLIC_KEY, {
        issuer: EXPECTED_ISSUER,
        audience: EXPECTED_AUDIENCE,
      });

      // Check Token Expiry
      if (payload.exp * 1000 < Date.now()) {
        return new Response(JSON.stringify({ error: "Token has expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Allow Access if JWT is Valid
      return new Response(JSON.stringify({ message: "JWT validation successful", user: payload.sub }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JWT", details: error.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
