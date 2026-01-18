// Wrapper that prefers native `bcrypt` and falls back to `bcryptjs`.
// Exports default object and named helpers: `hash`, `compare`, `genSalt`, `hashSync`, `compareSync`.

let bcryptMod;
try {
  const mod = await import("bcrypt");
  bcryptMod = mod?.default || mod;
} catch (e) {
  const mod = await import("bcryptjs");
  bcryptMod = mod?.default || mod;
}

const hash = (...args) => bcryptMod.hash(...args);
const compare = (...args) => bcryptMod.compare(...args);
const genSalt = (...args) =>
  bcryptMod.genSalt ? bcryptMod.genSalt(...args) : Promise.resolve(10);
const hashSync = (...args) =>
  bcryptMod.hashSync ? bcryptMod.hashSync(...args) : undefined;
const compareSync = (...args) =>
  bcryptMod.compareSync ? bcryptMod.compareSync(...args) : undefined;

export { hash, compare, genSalt, hashSync, compareSync };
const bcrypt = { hash, compare, genSalt, hashSync, compareSync };
export default bcrypt;
