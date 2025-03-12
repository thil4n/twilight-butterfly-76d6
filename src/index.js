import { Client } from '@neondatabase/serverless';

export default {
  async fetch(request, env, ctx) {
    const client = new Client(env.NEON_DB_URL);
    await client.connect();
    const { rows } = await client.query('SELECT * FROM revoked_tokens;');
    return new Response(JSON.stringify(rows));
  },
};
