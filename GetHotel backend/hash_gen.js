const bcrypt = require('bcryptjs');
const password = 'shriyanshking';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('NEW_HASH:', hash);
});
