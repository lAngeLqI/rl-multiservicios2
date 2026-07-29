// backend/src/generate-hash.js
const bcrypt = require('bcryptjs');

const password = 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error al generar hash:', err);
    return;
  }
  console.log('✅ Hash generado correctamente:');
  console.log('🔑 Contraseña:', password);
  console.log('🔐 Hash:', hash);
  console.log('\n📋 Copia este hash y actualiza en MySQL:');
  console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'operador@test.com';`);
});