const Jwt = require('@hapi/jwt');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (token) => {
    try {
      const artifacts = Jwt.token.decode(token);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      return artifacts.decoded.payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
  verifyAccessToken: (token) => {
    try {
      const artifacts = Jwt.token.decode(token);
      Jwt.token.verifySignature(artifacts, process.env.ACCESS_TOKEN_KEY);
      return artifacts.decoded.payload; // <-- pastikan payload dikembalikan utuh
    } catch (error) {
      throw new InvariantError('Access token tidak valid');
    }
  },
};
module.exports = TokenManager;
