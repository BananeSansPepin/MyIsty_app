const bcrypt = require('bcryptjs');

bcrypt.hash('admin', 10).then(hash => {
    console.log('Hash du mot de passe pour admin:', hash);
});
